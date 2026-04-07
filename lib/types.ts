export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  icon: any;
  title: string;
  description: string;
}

export interface Plan {
  name: string;
  price: string;
  popular?: boolean;
  description: string;
  features: string[];
  target?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface UseCase {
  icon: any;
  title: string;
  description: string;
}
