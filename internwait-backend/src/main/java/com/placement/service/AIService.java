package com.placement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;

    public AIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public static class AIResult {
        public Integer matchScore;
        public String feedback;
        
        public AIResult(Integer matchScore, String feedback) {
            this.matchScore = matchScore;
            this.feedback = feedback;
        }
    }

    public AIResult analyzeResume(String resumeText, String jobDescription, String jobRequirements) {
        if (apiKey == null || apiKey.equals("PUT_YOUR_GEMINI_API_KEY_HERE") || apiKey.isEmpty()) {
            // Mock response if API key is not provided (useful during development)
            return new AIResult(75, "Mock Feedback: No API Key provided. \nStrengths: Software Development. \nWeaknesses: Missing some specific skills listed in requirements.");
        }

        try {
            String prompt = String.format(
                    "You are an expert technical recruiter and HR manager. I want you to evaluate a candidate's resume against a Job Posting.\n\n" +
                    "Job Description: %s\n" +
                    "Job Requirements: %s\n\n" +
                    "Candidate Resume Content:\n%s\n\n" +
                    "Analyze the resume and return a response strictly in the following JSON format (no other text, just the JSON):\n" +
                    "{\"matchScore\": <a number from 0 to 100 representing how well the candidate fits the role>," +
                    "\"feedback\": \"<A short paragraph (3-4 sentences) outlining the candidate's key strengths and missing skills for this role>\"}",
                    jobDescription, jobRequirements, resumeText
            );

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);
            contents.put("parts", List.of(parts));
            requestBody.put("contents", List.of(contents));

            String response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.ofSeconds(15))
                    .block();

            return parseGeminiResponse(response);
            
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return new AIResult(0, "Error analyzing resume: " + e.getMessage());
        }
    }

    private AIResult parseGeminiResponse(String responseBody) {
        try {
            // A simple regex parser to extract matchScore and feedback since Gemini might wrap it in markdown code blocks
            Integer score = 0;
            String feedback = "Could not parse AI feedback.";

            // Find matchScore
            Pattern scorePattern = Pattern.compile("\"matchScore\"\\s*:\\s*(\\d+)");
            Matcher scoreMatcher = scorePattern.matcher(responseBody);
            if (scoreMatcher.find()) {
                score = Integer.parseInt(scoreMatcher.group(1));
            }

            // Find feedback
            Pattern feedbackPattern = Pattern.compile("\"feedback\"\\s*:\\s*\"(.*?)\"", Pattern.DOTALL);
            Matcher feedbackMatcher = feedbackPattern.matcher(responseBody);
            if (feedbackMatcher.find()) {
                feedback = feedbackMatcher.group(1).replace("\\n", "\n").replace("\\\"", "\"");
            }

            return new AIResult(score, feedback);
        } catch (Exception e) {
            System.err.println("Error parsing Gemini Response: " + e.getMessage());
            return new AIResult(0, "Error parsing AI response.");
        }
    }

    public List<String> generateInterviewQuestions(String jobTitle, String jobDescription) {
        String prompt = "You are an expert technical recruiter.\n" +
                "Generate exactly 3 technical or behavioral interview questions for a candidate applying for the role of '" + jobTitle + "'.\n" +
                "The questions must be highly relevant to this job description: " + jobDescription + "\n\n" +
                "Format: Return only the 3 questions separated by a double newline (\\n\\n). Do not include numbering, just the text of the questions.";

        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);
            
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", new Map[]{parts});
            requestBody.put("contents", new Map[]{contents});

            String responseBody = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.ofSeconds(15))
                    .block();
            
            if (responseBody == null) return List.of("Tell us about your background.", "Why do you want this job?", "What are your greatest strengths?");

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            String aiString = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            List<String> questions = new ArrayList<>();
            for (String q : aiString.split("\n\n")) {
                if (q != null && !q.trim().isEmpty()) {
                    questions.add(q.trim().replaceAll("^\\d+\\.\\s*", "")); // remove numbering if gemini adds it
                }
            }
            
            while(questions.size() < 3) questions.add("Tell us about a challenging project you worked on.");
            if(questions.size() > 3) questions = questions.subList(0, 3);
            
            return questions;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Tell us about your background.", "Why do you want this job?", "What are your greatest strengths?");
        }
    }

    public Map<String, Object> evaluateInterview(List<String> questions, List<String> answers) {
        StringBuilder prompt = new StringBuilder("You are an expert technical interviewer evaluating a candidate's responses.\n\n");
        for (int i = 0; i < questions.size(); i++) {
            prompt.append("Question ").append(i+1).append(": ").append(questions.get(i)).append("\n");
            prompt.append("Candidate Answer: ").append(i < answers.size() ? answers.get(i) : "No answer provided.").append("\n\n");
        }
        
        prompt.append("Evaluate these responses. Respond strictly with JSON in this format: {\"score\": [integer 0-100], \"feedback\": \"[detailed paragraph of feedback]\"}");

        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt.toString());
            
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", new Map[]{parts});
            requestBody.put("contents", new Map[]{contents});

            String responseBody = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.ofSeconds(15))
                    .block();
            
            if (responseBody == null) return createMockInterviewEvaluation();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            String aiString = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Extract JSON from potential Markdown block
            String jsonPart = aiString;
            if (aiString.contains("```json")) {
                jsonPart = aiString.split("```json")[1].split("```")[0].trim();
            } else if (aiString.contains("```")) {
                jsonPart = aiString.split("```")[1].split("```")[0].trim();
            }

            if (jsonPart != null) {
                JsonNode evalNode = mapper.readTree(jsonPart);
                Map<String, Object> eval = new HashMap<>();
                eval.put("score", evalNode.path("score").asInt(50));
                eval.put("feedback", evalNode.path("feedback").asText("Average responses."));
                return eval;
            } else {
                return createMockInterviewEvaluation();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return createMockInterviewEvaluation();
        }
    }
    
    private Map<String, Object> createMockInterviewEvaluation() {
        Map<String, Object> mock = new HashMap<>();
        mock.put("score", 75);
        mock.put("feedback", "Mock Evaluation: API error occurred or key is missing. The provided answers showed a basic understanding of the concepts but lacked depth. Consider elaborating with specific examples in real interviews.");
        return mock;
    }

    public String getJobRecommendations(String studentName, String skills, String jobListings) {
        if (apiKey == null || apiKey.equals("PUT_YOUR_GEMINI_API_KEY_HERE") || apiKey.isEmpty()) {
            return "[\n" +
                   "  {\"jobId\": 1, \"title\": \"Software Engineer\", \"companyName\": \"Tech Innovations\", \"reason\": \"Your Java skills are a perfect match for this role.\"}\n" +
                   "]";
        }

        try {
            String prompt = String.format(
                "You are an AI Career Assistant. The student's name is %s and their skills/profile are: %s.\n\n" +
                "Here is a list of open job postings:\n%s\n\n" +
                "Analyze the student's skills against these jobs. Select the top 1 to 3 best matching jobs. " +
                "Return a strict JSON array of objects with keys 'jobId', 'title', 'companyName', and 'reason' (a 1-2 sentence personalized explanation of why this is a good fit). Return ONLY the raw JSON array.",
                studentName, skills, jobListings
            );

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
            ));

            String responseBody = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.ofSeconds(15))
                    .block();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(responseBody);
            String aiString = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Extract JSON array
            if (aiString.contains("```json")) {
                aiString = aiString.split("```json")[1].split("```")[0].trim();
            } else if (aiString.contains("```")) {
                aiString = aiString.split("```")[1].split("```")[0].trim();
            }
            return aiString;
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    public String conductChatInterview(String jobTitle, String jobDescription, List<com.placement.controller.InterviewController.ChatMessage> history) {
        if (apiKey == null || apiKey.equals("PUT_YOUR_GEMINI_API_KEY_HERE") || apiKey.isEmpty()) {
            return "Mock AI: Can you please tell me more about your recent project?";
        }

        try {
            List<Map<String, Object>> contents = new ArrayList<>();
            boolean isFirstMessage = true;

            for (com.placement.controller.InterviewController.ChatMessage msg : history) {
                String role = msg.role.equals("user") ? "user" : "model";
                String text = msg.content;
                
                if (isFirstMessage && role.equals("user")) {
                    String systemInstructions = "You are an expert technical interviewer for the role: " + jobTitle + ".\n" +
                        "Job Description: " + jobDescription + "\n\n" +
                        "Conduct a realistic technical interview step-by-step. Ask ONE question at a time. " +
                        "Wait for the candidate's answer. Evaluate their last answer briefly, then ask the next question or follow-up. " +
                        "Maintain a professional tone. If they are struggling, give a hint. " +
                        "After exactly 4 questions have been answered by the candidate, conclude by providing a final /100 score and summary feedback. DO NOT output JSON, just talk naturally to the candidate except when concluding with the score.\n\n" +
                        "Candidate starts now:\n\n";
                    text = systemInstructions + text;
                    isFirstMessage = false;
                }
                
                Map<String, Object> part = new HashMap<>();
                part.put("text", text);
                
                Map<String, Object> contentMsg = new HashMap<>();
                contentMsg.put("role", role);
                contentMsg.put("parts", List.of(part));
                
                contents.add(contentMsg);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);

            String responseBody = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.ofSeconds(15))
                    .block();

            if (responseBody == null) return "An error occurred fetching AI response.";

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "I'm having trouble connecting right now. Let's try again in a moment.";
        }
    }

    public Map<String, Object> evaluateChatInterview(String jobTitle, String jobDescription, List<com.placement.controller.InterviewController.ChatMessage> history) {
        if (apiKey == null || apiKey.equals("PUT_YOUR_GEMINI_API_KEY_HERE") || apiKey.isEmpty()) {
            Map<String, Object> mock = new HashMap<>();
            mock.put("score", 85);
            mock.put("feedback", "Mock Evaluation: The candidate showed strong problem-solving skills and good understanding of " + jobTitle + " concepts.");
            return mock;
        }

        try {
            StringBuilder prompt = new StringBuilder();
            prompt.append("You are an expert technical interviewer evaluating a candidate's mock interview for the role of ").append(jobTitle).append(".\n");
            prompt.append("Job Description: ").append(jobDescription).append("\n\n");
            prompt.append("Below is the transcript of the interview between the AI interviewer (model) and the candidate (user):\n\n");
            
            for (com.placement.controller.InterviewController.ChatMessage msg : history) {
                String roleName = msg.role.equals("user") ? "Candidate" : "Interviewer";
                prompt.append(roleName).append(": ").append(msg.content).append("\n\n");
            }
            
            prompt.append("Evaluate the candidate's performance based on their answers. Respond strictly with JSON in this exact format: {\"score\": [integer 0-100 representing percentage match], \"feedback\": \"[detailed 3-4 sentence paragraph of feedback highlighting strengths and weaknesses]\"}");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt.toString())))
            ));

            String responseBody = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.ofSeconds(15))
                    .block();

            if (responseBody == null) return createMockInterviewEvaluation();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            String aiString = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Extract JSON from potential Markdown block
            String jsonPart = aiString;
            if (aiString.contains("```json")) {
                jsonPart = aiString.split("```json")[1].split("```")[0].trim();
            } else if (aiString.contains("```")) {
                jsonPart = aiString.split("```")[1].split("```")[0].trim();
            }

            if (jsonPart != null) {
                JsonNode evalNode = mapper.readTree(jsonPart);
                Map<String, Object> eval = new HashMap<>();
                eval.put("score", evalNode.path("score").asInt(50));
                eval.put("feedback", evalNode.path("feedback").asText("Average responses."));
                return eval;
            } else {
                return createMockInterviewEvaluation();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return createMockInterviewEvaluation();
        }
    }
}
