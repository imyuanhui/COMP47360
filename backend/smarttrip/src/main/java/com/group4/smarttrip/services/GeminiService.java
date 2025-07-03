package com.group4.smarttrip.services;


import com.google.genai.Client;
import com.google.genai.errors.ApiException;
import com.google.genai.types.GenerateContentResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private Client geminiClient;

    @PostConstruct
    public void initGeminiClient() {
        this.geminiClient = Client.builder().apiKey(geminiApiKey).build();
    }

    public String callGemini(String userInput) {

        if (geminiClient == null) {
            System.out.println("Gemini client was not initialized properly.");
            return null;
        }

        try {
            // Build the prompt, replacing placeholder with actual user input:
            String prompt = buildPrompt(userInput);

            // Make the API call
            GenerateContentResponse response = geminiClient.models.generateContent("gemini-2.5-flash", prompt, null);

            String resultText = response.text();
            if (resultText != null && !resultText.isBlank()) {
                System.out.println("Gemini response: " + resultText);
                return resultText;
            } else {
                System.err.println("Gemini response was empty.");
                return null;
            }
        } catch (ApiException e) {
            System.err.println("Gemini API error: " + e.getMessage());
            // Optionally, inspect e.getStatusCode() or e.getRetryDelay() for 429 handling.
            return null;
        } catch (Exception e) {
            System.err.println("Unexpected error calling Gemini: " + e.getMessage());
            return null;
        }
    }

     private String buildPrompt(String userInput) {
        return "You are a travel assistant for SmartTrip NYC. " +
                "A user describes their ideal day in Manhattan. From their input, extract these details and return them as a JSON object in the following format: \n" +
                "{\n" +
                "  \"zoneName\": <one of these allowed zones, or null if not relevant>,\n" +
                "  \"startingTime\": <hour in 24h format, default 9 if unspecified>,\n" +
                "  \"duration\": <number of hours, default 9 if unspecified>,\n" +
                "  \"placeCategory\": <a list of categories chosen only from the allowed categories below, or null if none can be inferred>\n" +
                "} \n" +
                "Here is the list of allowed zone names you must choose from:\n" +
                "[\"Times Square\", \"Central Park\", \"Empire State Building\", \"Brooklyn Bridge\", \"Statue of Liberty Ferry\", \"Rockefeller Center\", \"One World Trade Center\", \"Metropolitan Museum of Art\", \"Grand Central Terminal\", \"MoMA\", \"Roosevelt Island Tram\", \"Hudson River Kayaking\", \"The High Line\"]\n" +
                "\n" +
                "Here is the list of allowed place categories you must choose from:\n" +
                "[\"aquarium\", \"artwork\", \"attraction\", \"books\", \"cafe\", \"fast_food\", \"food_court\", \"gallery\", \"gift\", \"ice_cream\", \"jewelry\", \"library\", \"massage\", \"museum\", \"nightclub\", \"pub\", \"restaurant\", \"toys\", \"viewpoint\", \"zoo\"]\n" +
                "\n" +
                "- If user input doesn’t specify a location, set \"zoneName\" to null.\n" +
                "- If user specifies a location similar to one of these zones, match it to the closest zone name from the list.\n" +
                "- Place categories should be picked only from the allowed list; choose categories that best fit the user’s preferences or described activities.\n" +
                "\n" +
                "Examples:\n" +
                "\n" +
                "1) Input: \"I want a relaxing afternoon with my partner in Times Square.\"\n" +
                "   Output: {\n" +
                "     \"zoneName\": \"Times Square\",\n" +
                "     \"startingTime\": 12,\n" +
                "     \"duration\": 6,\n" +
                "     \"placeCategory\": [\"cafe\", \"gallery\"]\n" +
                "   }\n" +
                "\n" +
                "2) Input: \"Fun day with my kids in Central Park.\"\n" +
                "   Output: {\n" +
                "     \"zoneName\": \"Central Park\",\n" +
                "     \"startingTime\": 9,\n" +
                "     \"duration\": 9,\n" +
                "     \"placeCategory\": [\"zoo\", \"aquarium\", \"ice_cream\"]\n" +
                "   }\n" +
                "\n" +
                "3) Input: \"I'd like to explore some cool art spots and chill cafes.\"\n" +
                "   Output: {\n" +
                "     \"zoneName\": null,\n" +
                "     \"startingTime\": 9,\n" +
                "     \"duration\": 9,\n" +
                "     \"placeCategory\": [\"gallery\", \"cafe\"]\n" +
                "   }" +
                "Now analyze this input and return the JSON:\n\"" + userInput + "\"";
    }
}
