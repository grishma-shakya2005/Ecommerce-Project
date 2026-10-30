import { Schema, model, Document } from 'mongoose';

export interface IAboutContent extends Document {
  heroTitle: string;
  heroSubtitle: string;
  storyHeading: string;
  storyParagraphs: string[];
  storyImage: string;
  values: Array<{ title: string; text: string }>;
  team: Array<{ _id?: string; name: string; role: string; bio: string; photo: string; visible: boolean; order: number }>;
  faqs: Array<{ _id?: string; question: string; answer: string; visible: boolean; order: number }>;
}

const aboutSchema = new Schema<IAboutContent>(
  {
    heroTitle: { type: String, required: true },
    heroSubtitle: { type: String, required: true },
    storyHeading: { type: String, required: true },
    storyParagraphs: { type: [String], default: [] },
    storyImage: { type: String, default: '' },
    values: [{
      title: { type: String, required: true },
      text: { type: String, required: true },
    }],
    team: [{
      name: { type: String, required: true },
      role: { type: String, required: true },
      bio: { type: String, default: '' },
      photo: { type: String, default: '' },
      visible: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    }],
    faqs: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
      visible: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    }],
  },
  { timestamps: true },
);

export default model<IAboutContent>('AboutContent', aboutSchema);
