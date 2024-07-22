import ticketModel from "../../dao/models/ticket.model.js";

export class ticketManager {
    constructor(model){
        this.ticketModel = model;
    }

    async getTickets(){
        return await ticketModel.find({});
    };

    async getTicketByID(tid){
        return await ticketModel.findById({ _id: tid });
    };

    async createTicket(ticket){
        return await ticketModel.create(ticket);
    };
};