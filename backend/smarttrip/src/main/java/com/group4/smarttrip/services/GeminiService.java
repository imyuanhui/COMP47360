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
                "A user describes their ideal day in Manhattan. Your task is to extract key planning details from the input and return them as a JSON object in the following format:\n\n" +
                "{\n" +
                "  \"zoneName\": <one of the allowed zones below, or null if not mentioned>,\n" +
                "  \"startingTime\": <hour in 24h format, default 9 if unspecified>,\n" +
                "  \"duration\": <number of hours, default 9 if unspecified>,\n" +
                "  \"placeCategory\": <a list of categories chosen only from the allowed categories below, or null if none can be inferred>\n" +
                "}\n\n" +
                "Allowed zone names (choose from this list only):\n" +
                "[\"One World Trade Center\", \"Wall Street\", \"Statue of Liberty Ferry\", \"Battery Park\", \"Canal Street\", \"Doyers Street\", \"Hudson River Park Pier 25\", \"Spring Street\", \"Washington Square Park\", \"Bleecker Street\", \"The High Line\", \"Chelsea Market\", \"Flatiron Building\", \"Union Square Park\", \"Times Square\", \"MoMA\", \"Rockefeller Center\", \"Grand Central Terminal\", \"Empire State Building\", \"Koreatown 32nd Street\", \"American Museum of Natural History\", \"Lincoln Center\", \"Metropolitan Museum of Art\", \"Guggenheim Museum\", \"Bethesda Fountain\", \"Great Lawn\", \"Apollo Theater\", \"Marcus Garvey Park\", \"The Cloisters\", \"Fort Tryon Park\", \"Roosevelt Island Tram\", \"Four Freedoms Park\"]\n\n" +
                "Allowed place categories (choose only from this list):\n" +
                "[\"aquarium\", \"art\", \"arts_centre\", \"artwork\", \"attraction\", \"bakery\", \"bar\", \"books\", \"cafe\", \"chocolate\", \"coffee\", \"coffee;tea\", \"fast_food\", \"food\", \"food_court\", \"gallery\", \"gift\", \"ice_cream\", \"karaoke\", \"marketplace\", \"museum\", \"outdoor\", \"pasta\", \"pastry\", \"pub\", \"restaurant\", \"sauna\", \"seafood\", \"sightseeing\", \"spa\", \"tea\", \"toys\", \"viewpoint\", \"zoo\"]\n\n" +
                "- If user input doesn’t specify a location, set \"zoneName\" to \"Times Square\" by default.\n" +
                "- If user input mentions a location that resembles a zone in the list, match it to the most relevant zone name.\n" +
                "- Choose 3+ place categories for a short (<=4 hours) trip and 4+ for a full-day (>4 hours) trip.\n" +
                "- If user describes interests (e.g., relaxing, family, art, scenic), infer the most relevant categories.\n" +
                "- Do not invent new zones or categories. Stick strictly to the allowed lists above.\n\n" +
                "Now analyze this input and return a valid JSON object based on it:\n" +
                "\"" + userInput + "\"";
    }
}
