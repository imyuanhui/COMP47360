# Build the Maven project
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Use a lightweight JDK 21 runtime image
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy only the final JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
