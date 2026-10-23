package com.helpdesk.helpdesk_backend.controller;

import com.helpdesk.helpdesk_backend.exception.TicketValidationException;
import com.helpdesk.helpdesk_backend.model.TicketNote;
import com.helpdesk.helpdesk_backend.service.TicketNoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets/{ticketId}/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketNoteController {

    private final TicketNoteService ticketNoteService;

    public TicketNoteController(TicketNoteService ticketNoteService) {
        this.ticketNoteService = ticketNoteService;
    }

    @GetMapping
    public ResponseEntity<List<TicketNote>> getNotes(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                ticketNoteService.getNotes(ticketId)
        );
    }

    @PostMapping
    public ResponseEntity<?> addNote(
            @PathVariable Long ticketId,
            @RequestBody CreateNoteRequest request) {

        TicketNote note = ticketNoteService.addNote(
            ticketId,
            request.content(),
            request.visibleToRequester(),
            request.senderType()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    @ExceptionHandler(TicketValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            TicketValidationException ex) {

        return ResponseEntity.badRequest()
                .body(Map.of("message", ex.getMessage()));
    }

    public record CreateNoteRequest(
        String content,
        boolean visibleToRequester,
        String senderType) {
}
}