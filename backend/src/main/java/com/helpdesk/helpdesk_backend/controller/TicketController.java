package com.helpdesk.helpdesk_backend.controller;

import com.helpdesk.helpdesk_backend.exception.TicketValidationException;
import com.helpdesk.helpdesk_backend.model.Ticket;
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

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
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

    @ExceptionHandler(TicketValidationException.class)
    public ResponseEntity<Map<String, String>> handleTicketValidationException(
            TicketValidationException ex) {

        return ResponseEntity.badRequest()
                .body(Map.of("message", ex.getMessage()));
    }

    public record CreateTicketRequest(
            String title,
            String description,
            String category,
            String priority) {
    }
}
