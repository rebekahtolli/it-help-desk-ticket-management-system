package com.helpdesk.helpdesk_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_notes")
public class TicketNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "author_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "visible_to_requester", nullable = false)
    private boolean visibleToRequester = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isVisibleToRequester() {
        return visibleToRequester;
    }

    public void setVisibleToRequester(boolean visibleToRequester) {
        this.visibleToRequester = visibleToRequester;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}