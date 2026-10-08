package com.helpdesk.helpdesk_backend.service;

import com.helpdesk.helpdesk_backend.exception.TicketValidationException;
import com.helpdesk.helpdesk_backend.model.Category;
import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.TicketPriority;
import com.helpdesk.helpdesk_backend.model.TicketStatus;
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

    /**
     * Search and filter tickets. All arguments are optional.
     * Null or blank means no filter on that field.
     * A numeric keyword is also treated as a ticket ID.
     */
    public List<Ticket> searchTickets(
            String keyword,
            String statusRaw,
            String priorityRaw,
            String categoryName) {

        String validKeyword = blankToNull(keyword);
        Long ticketId = parseTicketId(validKeyword);

        TicketStatus status = isBlank(statusRaw) ? null : parseStatus(statusRaw);
        TicketPriority priority = isBlank(priorityRaw) ? null : parsePriority(priorityRaw);

        return ticketRepository.search(
                validKeyword,
                ticketId,
                status,
                priority,
                blankToNull(categoryName)
        );
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

    public List<User> getItStaff() {
        return userRepository.findByRoleIgnoreCase("IT_STAFF");
    }

    public Ticket assignTicket(Long ticketId, Long staffId) {
        Ticket ticket = getRequiredTicket(ticketId);

        User staff = userRepository.findById(staffId)
                .orElseThrow(() ->
                        new TicketValidationException(
                                "IT staff member was not found."
                        ));

        if (!"IT_STAFF".equalsIgnoreCase(staff.getRole())) {
            throw new TicketValidationException(
                    "Selected user is not an IT staff member."
            );
        }

        ticket.setAssignedStaff(staff);

        return ticketRepository.save(ticket);
    }

    public Ticket updateStatus(Long ticketId, String statusRaw) {
        Ticket ticket = getRequiredTicket(ticketId);

        ticket.setStatus(parseStatus(statusRaw));

        return ticketRepository.save(ticket);
    }

    public Ticket updatePriority(Long ticketId, String priorityRaw) {
        Ticket ticket = getRequiredTicket(ticketId);

        ticket.setPriority(parsePriority(priorityRaw));

        return ticketRepository.save(ticket);
    }

    public Ticket updateCategory(Long ticketId, String categoryName) {
        Ticket ticket = getRequiredTicket(ticketId);

        String validCategoryName =
                requireText(categoryName, "Ticket category is required.");

        ticket.setCategory(resolveCategory(validCategoryName));

        return ticketRepository.save(ticket);
    }

    private Ticket getRequiredTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new TicketValidationException(
                                "Ticket #" + ticketId + " was not found."
                        ));
    }

    private String requireText(String value, String errorMessage) {
        if (value == null || value.trim().isEmpty()) {
            throw new TicketValidationException(errorMessage);
        }

        return value.trim();
    }

    private TicketPriority parsePriority(String priorityRaw) {
        try {
            return TicketPriority.valueOf(
                    priorityRaw.trim().toUpperCase()
            );
        } catch (Exception e) {
            throw new TicketValidationException(
                    "Invalid ticket priority."
            );
        }
    }

    private TicketStatus parseStatus(String statusRaw) {
        try {
            return TicketStatus.valueOf(
                    statusRaw.trim().toUpperCase()
            );
        } catch (Exception e) {
            throw new TicketValidationException(
                    "Invalid ticket status."
            );
        }
    }

    private Long parseTicketId(String keyword) {
        if (keyword == null) {
            return null;
        }

        String candidate = keyword.startsWith("#")
                ? keyword.substring(1)
                : keyword;

        try {
            return Long.valueOf(candidate.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private User resolveRequester() {
        return userRepository
                .findByUsername("alex.carter")
                .orElseGet(() ->
                        userRepository.save(
                                new User(
                                        "alex.carter",
                                        "NOT_USED_FOR_AUTHENTICATION",
                                        "REQUESTER",
                                        "Alex Carter",
                                        "alex.carter@example.com"
                                )
                        )
                );
    }

    private Category resolveCategory(String categoryName) {
        return categoryRepository
                .findByNameIgnoreCase(categoryName)
                .orElseGet(() ->
                        categoryRepository.save(
                                new Category(
                                        categoryName,
                                        "Help desk ticket category"
                                )
                        )
                );
    }
}