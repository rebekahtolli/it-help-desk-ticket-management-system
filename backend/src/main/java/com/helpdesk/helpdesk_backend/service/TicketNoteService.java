package com.helpdesk.helpdesk_backend.service;

import com.helpdesk.helpdesk_backend.exception.TicketValidationException;
import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.TicketNote;
import com.helpdesk.helpdesk_backend.model.User;
import com.helpdesk.helpdesk_backend.repository.TicketNoteRepository;
import com.helpdesk.helpdesk_backend.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketNoteService {

    private final TicketNoteRepository ticketNoteRepository;
    private final TicketRepository ticketRepository;

    public TicketNoteService(
            TicketNoteRepository ticketNoteRepository,
            TicketRepository ticketRepository) {
        this.ticketNoteRepository = ticketNoteRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public List<TicketNote> getNotes(Long ticketId) {
        getRequiredTicket(ticketId);

        return ticketNoteRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    @Transactional
    public TicketNote addNote(
            Long ticketId,
            String content,
            boolean visibleToRequester,
            String senderType) {

        Ticket ticket = getRequiredTicket(ticketId);

        if (content == null || content.trim().isEmpty()) {
            throw new TicketValidationException(
                    "Note content is required.");
        }

        User author;

        if ("IT_STAFF".equalsIgnoreCase(senderType)) {
            author = ticket.getAssignedStaff();

            if (author == null
                    || !"IT_STAFF".equalsIgnoreCase(author.getRole())) {
                throw new TicketValidationException(
                        "This ticket must be assigned to IT staff before they can send a message.");
            }
        } else if ("USER".equalsIgnoreCase(senderType)) {
            author = ticket.getRequester();

            if (author == null) {
                throw new TicketValidationException(
                        "This ticket has no requester.");
            }
        } else {
            throw new TicketValidationException(
                    "Invalid message sender type.");
        }

        TicketNote note = new TicketNote();
        note.setTicket(ticket);
        note.setAuthor(author);
        note.setContent(content.trim());
        note.setVisibleToRequester(
                "IT_STAFF".equalsIgnoreCase(senderType)
                        ? visibleToRequester
                        : true
        );

        return ticketNoteRepository.save(note);
    }

    private Ticket getRequiredTicket(Long ticketId) {
        if (ticketId == null) {
            throw new TicketValidationException(
                    "Ticket ID is required.");
        }

        return ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new TicketValidationException(
                                "Ticket #" + ticketId + " was not found."));
    }
}