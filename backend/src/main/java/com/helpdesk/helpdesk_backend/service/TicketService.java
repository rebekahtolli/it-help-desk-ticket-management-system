package com.helpdesk.helpdesk_backend.service;

import com.helpdesk.helpdesk_backend.exception.TicketValidationException;
import com.helpdesk.helpdesk_backend.model.Category;
import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.TicketPriority;
import com.helpdesk.helpdesk_backend.model.User;
import com.helpdesk.helpdesk_backend.repository.CategoryRepository;
import com.helpdesk.helpdesk_backend.repository.TicketRepository;
import com.helpdesk.helpdesk_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public Ticket createTicket(
            String title,
            String description,
            String categoryName,
            String priorityRaw) {

        String validTitle = requireText(title, "Ticket title is required.");
        String validDescription = requireText(description, "Ticket description is required.");
        String validCategoryName = requireText(categoryName, "Ticket category is required.");
        TicketPriority priority = parsePriority(priorityRaw);

        User requester = resolveRequester();
        Category category = resolveCategory(validCategoryName);

        Ticket ticket = new Ticket();

        ticket.setTitle(validTitle);
        ticket.setDescription(validDescription);
        ticket.setPriority(priority);
        ticket.setCategory(category);
        ticket.setRequester(requester);

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsForRequester(User requester) {
        return ticketRepository.findByRequester(requester);
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Ticket updateTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    private String requireText(String value, String errorMessage) {
        if (value == null || value.trim().isEmpty()) {
            throw new TicketValidationException(errorMessage);
        }

        return value.trim();
    }

    private TicketPriority parsePriority(String priorityRaw) {
        try {
            return TicketPriority.valueOf(priorityRaw.trim().toUpperCase());
        } catch (Exception e) {
            throw new TicketValidationException("Invalid ticket priority.");
        }
    }

    private User resolveRequester() {
        return userRepository
                .findByUsername("alex.carter")
                .orElseGet(() -> userRepository.save(
                        new User(
                                "alex.carter",
                                "NOT_USED_FOR_AUTHENTICATION",
                                "REQUESTER",
                                "Alex Carter",
                                "alex.carter@example.com"
                        )
                ));
    }

    private Category resolveCategory(String categoryName) {
        return categoryRepository
                .findAll()
                .stream()
                .filter(c -> c.getName().equalsIgnoreCase(categoryName))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(
                        new Category(categoryName, "Help desk ticket category")
                ));
    }
}
