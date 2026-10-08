package com.helpdesk.helpdesk_backend;

import com.helpdesk.helpdesk_backend.model.User;
import com.helpdesk.helpdesk_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(UserRepository userRepository) {
        return args -> {

            if (userRepository.findByUsername("rebekah.tolliver").isEmpty()) {
                userRepository.save(
                        new User(
                                "rebekah.tolliver",
                                "NOT_USED_FOR_AUTHENTICATION",
                                "IT_STAFF",
                                "Rebekah Tolliver",
                                "rebekah.tolliver@example.com"
                        )
                );
            }

            if (userRepository.findByUsername("griffin.hulet").isEmpty()) {
                userRepository.save(
                        new User(
                                "griffin.hulet",
                                "NOT_USED_FOR_AUTHENTICATION",
                                "IT_STAFF",
                                "Griffin Hulet",
                                "griffin.hulet@example.com"
                        )
                );
            }
        };
    }
}