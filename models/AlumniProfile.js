import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const visibilityEnum = ["everyone", "connections", "nobody"];

const AlumniProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // Maharaja College record
    admissionYear: { type: Number },
    passingYear: { type: Number },
    course: { type: String, trim: true }, // e.g. B.A., B.Sc., M.A.
    department: { type: String, trim: true },

    // Where they're from / where they are now
    homeTown: { type: String, trim: true },
    homeState: { type: String, trim: true },
    currentCity: { type: String, trim: true },
    currentState: { type: String, trim: true },
    currentCountry: { type: String, default: "India", trim: true },

    // Career (kept simple on the profile for MVP — a dedicated Career
    // collection can split this out once people have multiple roles)
    profession: { type: String, trim: true },
    organization: { type: String, trim: true },
    designation: { type: String, trim: true },
    professionVerified: { type: Boolean, default: false },

    hostelStatus: { type: String, enum: ["Hosteller", "Day Scholar", ""], default: "" },

    bio: { type: String, maxlength: 600, default: "" },

    // Controls whether this profile appears in directory search and the
    // homepage's featured Maharajians — not whether it's viewable at all.
    // A verified member can still open a private profile via a direct
    // link; it just won't be surfaced to people who aren't looking for
    // them by name.
    isPublic: { type: Boolean, default: true },

    privacy: {
      phone: { type: String, enum: visibilityEnum, default: "connections" },
      email: { type: String, enum: visibilityEnum, default: "connections" },
      address: { type: String, enum: visibilityEnum, default: "nobody" },
    },
  },
  { timestamps: true }
);

AlumniProfileSchema.index({ currentCity: 1 });
AlumniProfileSchema.index({ passingYear: 1 });
AlumniProfileSchema.index({ profession: 1 });

export default models.AlumniProfile || model("AlumniProfile", AlumniProfileSchema);
