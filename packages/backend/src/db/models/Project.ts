import mongoose, { Schema } from "mongoose";
import type { Project } from "@viragen/shared";

export interface ProjectDocument {
  _id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  systemPrompt: string;
  knowledge: string;
  analyzerPrompt?: string;
  imageSystemPrompt?: string;
  videoSystemPrompt?: string;
}

const ProjectSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    systemPrompt: { type: String, required: true },
    knowledge: { type: String, default: "" },
    analyzerPrompt: { type: String, default: "" },
    imageSystemPrompt: { type: String, default: "" },
    videoSystemPrompt: { type: String, default: "" },
  },
  {
    _id: false,
    versionKey: false,
  }
);

ProjectSchema.index({ userId: 1, updatedAt: -1 });
ProjectSchema.index({ updatedAt: -1 });

export const ProjectModel = mongoose.model<ProjectDocument>("Project", ProjectSchema);

export function toProject(doc: ProjectDocument): Project {
  return {
    id: doc._id,
    userId: doc.userId,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    systemPrompt: doc.systemPrompt,
    knowledge: doc.knowledge,
    analyzerPrompt: doc.analyzerPrompt,
    imageSystemPrompt: doc.imageSystemPrompt,
    videoSystemPrompt: doc.videoSystemPrompt,
  };
}
