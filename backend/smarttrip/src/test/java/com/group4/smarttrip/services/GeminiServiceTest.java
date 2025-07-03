package com.group4.smarttrip.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class GeminiServiceTest {
    @Autowired
    private GeminiService geminiService;


    @Test
    void testCallGemini() {
        String userInput = "First time to visit NYC, hope to have a good afternoon with my two young daughters.";

        String output = geminiService.callGemini(userInput);

        assertNotNull(output);

    }
}
