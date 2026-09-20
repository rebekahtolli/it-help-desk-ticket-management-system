package com.helpdesk.helpdesk_backend.repository;

import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByRequester(User requester);

    List<Ticket> findByStatus(String status);

    List<Ticket> findByPriority(String priority);
}