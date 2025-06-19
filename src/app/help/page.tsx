'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqs = [
    {
      id: "accuracy",
      question: "How accurate is plant identification?",
      answer: "FloraFind uses advanced AI to identify plants with high accuracy. However, accuracy depends on image quality, plant visibility, and whether the species is in our database. We recommend taking clear, well-lit photos that show distinctive features like leaves, flowers, and stems."
    },
    {
      id: "offline",
      question: "Can I use FloraFind offline?",
      answer: "Currently, FloraFind requires an internet connection to process identification requests. We're working on an offline mode for future releases that will allow basic identification without connectivity."
    },
    {
      id: "garden",
      question: "How do I save plants to my garden?",
      answer: "After identifying a plant, you'll see a \"Save to Garden\" button on the results screen. Click this button to add the plant to your personal garden collection. You must be logged in to use this feature."
    },
    {
      id: "limit",
      question: "Is there a limit to how many plants I can identify?",
      answer: "Free accounts can identify up to 10 plants per day. Premium subscribers have unlimited identifications. Your daily limit resets at midnight UTC."
    },
    {
      id: "toxic",
      question: "Can FloraFind identify toxic plants?",
      answer: "Yes, FloraFind can identify many toxic plants and will display a warning when a potentially toxic species is identified. However, never rely solely on an app for safety decisions. Always consult with experts before handling or consuming any plant."
    },
    {
      id: "edible",
      question: "Does FloraFind identify edible plants?",
      answer: "While FloraFind can identify many edible plants, we strongly advise against consuming any plant based solely on our identification. Always verify with multiple trusted sources and consult with experts before consuming any wild plant."
    },
    {
      id: "camera",
      question: "What's the best way to take a photo for identification?",
      answer: "For best results, take clear, well-lit photos that show multiple parts of the plant (leaves, flowers, stem, overall structure). Avoid shadows, blurry images, and make sure the plant fills most of the frame. Multiple photos from different angles often help with more accurate identification."
    },
    {
      id: "privacy",
      question: "How is my plant data and photos handled?",
      answer: "We take your privacy seriously. Your plant photos are processed securely for identification purposes and stored in your account if you save them. We don't share your personal plant collection with third parties. You can delete your data at any time from your account settings."
    }
  ];
  
  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about FloraFind</p>
      </div>
      
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Common Questions</CardTitle>
          <CardDescription>
            Everything you need to know about using FloraFind
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map(faq => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-sm mt-2">Try a different search term or browse all FAQs by clearing the search</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Contact Support Section */}
      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>
            Our support team is ready to assist you with any questions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1 border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Send us an email and we'll get back to you within 24 hours.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="mailto:support@florafind.com">
                  Contact via Email
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex-1 border bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chat with our support team during business hours (9am-5pm EST).
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Start Chat
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
} 