"use client";

import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// In a real app, we would fetch this from the API (which reads the JSON)
// For now, we hardcode the schema we just designed to prototype the UI.
const MODE_SCHEMA = {
  "ebeg": {
    "name": "E-Beg (Donation)",
    "description": "Optimized for sympathy, wit, and urgency.",
    "theme": "bg-emerald-500",
    "badge": "bg-emerald-100 text-emerald-800",
    "fields": ["Donation Link", "Urgency Level", "Cause Story"]
  },
  "content": {
    "name": "Content (Thought Leadership)",
    "description": "For high-value educational content.",
    "theme": "bg-indigo-600",
    "badge": "bg-indigo-100 text-indigo-800",
    "fields": ["Topic", "Key Insight", "Complexity Level"]
  },
  "promotion": {
    "name": "Promotion (Sales)",
    "description": "For selling Products, Services, or Hardware.",
    "theme": "bg-blue-600",
    "badge": "bg-blue-100 text-blue-800",
    "fields": ["Product Name", "Price", "Benefit List"]
  },
  "political": {
    "name": "Political (Advocacy)",
    "description": "Focus on goals, objectives, and mobilization.",
    "theme": "bg-red-700",
    "badge": "bg-red-100 text-red-800",
    "fields": ["Objective", "Target Audience", "Action Required"]
  }
};

export default function ModeSwitcher() {
  const [activeMode, setActiveMode] = useState("content");
  const currentConfig = MODE_SCHEMA[activeMode as keyof typeof MODE_SCHEMA];

  return (
    <div className="w-full space-y-6">
      {/* 1. The Switcher */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Campaign Mode</h3>
          <p className="text-sm text-gray-500">Select the operational personality for this workspace.</p>
        </div>
        <div className="w-[250px]">
            {/* Native Select for simplicity in prototype, can upgrade to Shadcn Select later */}
            <select 
                className="w-full p-2 border rounded-md"
                value={activeMode}
                onChange={(e) => setActiveMode(e.target.value)}
            >
                {Object.entries(MODE_SCHEMA).map(([key, config]) => (
                    <option key={key} value={key}>
                        {config.name}
                    </option>
                ))}
            </select>
        </div>
      </div>

      {/* 2. The Dynamic UI Preview */}
      <Card className={`border-t-4 ${currentConfig.theme.replace("bg-", "border-")}`}>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>New Campaign: {currentConfig.name}</CardTitle>
                <Badge className={currentConfig.badge}>{activeMode.toUpperCase()}</Badge>
            </div>
            <p className="text-gray-500">{currentConfig.description}</p>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {/* Dynamic Fields based on Mode */}
                {currentConfig.fields.map((field) => (
                    <div key={field} className="space-y-2">
                        <label className="text-sm font-medium">{field}</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-md bg-gray-50" 
                            placeholder={`Enter ${field}...`}
                        />
                    </div>
                ))}
                
                {/* Dynamic Button */}
                <button className={`w-full py-2 text-white font-bold rounded-md ${currentConfig.theme}`}>
                    Generate {currentConfig.name.split(" ")[0]} Campaign
                </button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
