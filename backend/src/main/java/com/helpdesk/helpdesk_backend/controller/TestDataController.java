package com.helpdesk.helpdesk_backend.controller;

import com.helpdesk.helpdesk_backend.model.Category;
import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.TicketPriority;
import com.helpdesk.helpdesk_backend.model.User;
import com.helpdesk.helpdesk_backend.repository.CategoryRepository;
import com.helpdesk.helpdesk_backend.repository.UserRepository;
import com.helpdesk.helpdesk_backend.service.TicketService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestDataController {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TicketService ticketService;

    public TestDataController(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            TicketService ticketService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.ticketService = ticketService;
    }

    @PostMapping("/ticket")
    public Ticket createTestTicket() {

        User requester = userRepository.findByUsername("alex.carter")
                .orElseGet(() -> userRepository.save(
                        new User(
                                "alex.carter",
                                "testpassword",
                                "REQUESTER",
                                "Alex Carter",
                                "alex.carter@example.com"
                        )
                ));

        Category category = categoryRepository.findAll()
                .stream()
                .filter(c -> c.getName().equals("Network/Internet"))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(
                        new Category(
                                "Network/Internet",
                                "Internet and network connectivity problems"
                        )
                ));

        Ticket ticket = new Ticket();

        ticket.setTitle("Laptop cannot connect to Wi-Fi");
        ticket.setDescription(
                "My laptop cannot connect to the school Wi-Fi. " +
                "I have restarted the laptop, but the problem continues."
        );
        ticket.setPriority(TicketPriority.HIGH);
        ticket.setCategory(category);
        ticket.setRequester(requester);

        return ticketService.createTicket(ticket);
    }
}