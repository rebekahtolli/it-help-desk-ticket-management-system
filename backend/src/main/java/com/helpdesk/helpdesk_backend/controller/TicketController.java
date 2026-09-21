package com.helpdesk.helpdesk_backend.controller;

import com.helpdesk.helpdesk_backend.model.Category;
import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.TicketPriority;
import com.helpdesk.helpdesk_backend.model.User;
import com.helpdesk.helpdesk_backend.repository.CategoryRepository;
import com.helpdesk.helpdesk_backend.repository.UserRepository;
import com.helpdesk.helpdesk_backend.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TicketController(
            TicketService ticketService,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody CreateTicketRequest request) {

        if (request.title() == null || request.title().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Ticket title is required."));
        }

        if (request.description() == null || request.description().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Ticket description is required."));
        }

        TicketPriority priority;

        try {
            priority = TicketPriority.valueOf(request.priority().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid ticket priority."));
        }

        User requester = userRepository.findByUsername("alex.carter")
                .orElseGet(() -> userRepository.save(
                		new User(
                			    "alex.carter",
                			    "NOT_USED_FOR_AUTHENTICATION",
                			    "REQUESTER",
                			    "Alex Carter",
                			    "alex.carter@example.com"
                			))
                ));

        Category category = categoryRepository.findAll()
                .stream()
                .filter(c -> c.getName().equalsIgnoreCase(request.category()))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(
                        new Category(
                                request.category(),
                                "Help desk ticket category"
                        )
                ));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description().trim());
        ticket.setPriority(priority);
        ticket.setCategory(category);
        ticket.setRequester(requester);

        Ticket savedTicket = ticketService.createTicket(ticket);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTicket);
    }

    public record CreateTicketRequest(
            String title,
            String description,
            String category,
            String priority
    ) {
    }
}