import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: false, // doctor is optional for direct booking
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialty: {
      type: String, // for direct booking by field
      required: false,
    },
    // changed: make ticketPrice optional with a safe default
    ticketPrice: { type: String, default: '0' },
    appointmentDate: {
      type: Date, // date only
      required: true,
    },
    timeSlot: {
      type: String, // e.g., '9-10am'
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    reason: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
