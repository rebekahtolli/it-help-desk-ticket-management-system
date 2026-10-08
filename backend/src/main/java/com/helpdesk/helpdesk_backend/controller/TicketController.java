package com.helpdesk.helpdesk_backend.controller;

import com.helpdesk.helpdesk_backend.exception.TicketValidationException;
import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.User;
import com.helpdesk.helpdesk_backend.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<Ticket> getTickets(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category) {

        return ticketService.searchTickets(
                q,
                status,
                priority,
                category
        );
    }

    @GetMapping("/staff")
    public List<StaffResponse> getItStaff() {
        return ticketService.getItStaff()
                .stream()
                .map(user ->
                        new StaffResponse(
                                user.getId(),
                                user.getFullName(),
                                user.getUsername()
                        )
                )
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(
            @PathVariable Long id) {

        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @RequestBody CreateTicketRequest request) {

        Ticket savedTicket = ticketService.createTicket(
                request.title(),
                request.description(),
                request.category(),
                request.priority()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTicket);
    }

    @PutMapping("/{id}/assignment")
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable Long id,
            @RequestBody AssignmentRequest request) {

        return ResponseEntity.ok(
                ticketService.assignTicket(
                        id,
                        request.staffId()
                )
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable Long id,
            @RequestBody ValueRequest request) {

        return ResponseEntity.ok(
                ticketService.updateStatus(
                        id,
                        request.value()
                )
        );
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<Ticket> updatePriority(
            @PathVariable Long id,
            @RequestBody ValueRequest request) {

        return ResponseEntity.ok(
                ticketService.updatePriority(
                        id,
                        request.value()
                )
        );
    }

    @PutMapping("/{id}/category")
    public ResponseEntity<Ticket> updateCategory(
            @PathVariable Long id,
            @RequestBody ValueRequest request) {

        return ResponseEntity.ok(
                ticketService.updateCategory(
                        id,
                        request.value()
                )
        );
    }

    @ExceptionHandler(TicketValidationException.class)
    public ResponseEntity<Map<String, String>> handleTicketValidationException(
            TicketValidationException ex) {

        return ResponseEntity
                .badRequest()
                .body(Map.of("message", ex.getMessage()));
    }

    public record CreateTicketRequest(
            String title,
            String description,
            String category,
            String priority) {
    }

    public record AssignmentRequest(
            Long staffId) {
    }

    public record ValueRequest(
            String value) {
    }

    public record StaffResponse(
            Long id,
            String fullName,
            String username) {
    }
}
