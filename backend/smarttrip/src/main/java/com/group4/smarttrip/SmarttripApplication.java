package com.group4.smarttrip;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SmarttripApplication {
	public static void main(String[] args) {
		SpringApplication.run(SmarttripApplication.class, args);
	}

}
