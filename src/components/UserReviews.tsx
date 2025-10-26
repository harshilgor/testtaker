import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  score: number;
  university: string;
  text: string;
  avatar: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Chen",
    score: 1580,
    university: "Harvard University",
    text: "get1600.co helped me improve my SAT score by 200+ points! The adaptive learning system was incredible - it knew exactly what I needed to work on.",
    avatar: "SC"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    score: 1560,
    university: "MIT",
    text: "The performance analytics are game-changing. I could see my progress in real-time and focus on my weakest areas. Highly recommend!",
    avatar: "MJ"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    score: 1570,
    university: "Stanford University",
    text: "The mock tests were so realistic! I felt completely prepared on test day. The detailed explanations for every question made all the difference.",
    avatar: "ER"
  },
  {
    id: 4,
    name: "David Kim",
    score: 1590,
    university: "Yale University",
    text: "Best SAT prep platform I've used. The AI-powered feedback helped me understand concepts I'd been struggling with for months.",
    avatar: "DK"
  },
  {
    id: 5,
    name: "Jessica Wang",
    score: 1550,
    university: "Princeton University",
    text: "The leaderboard feature kept me motivated throughout my prep. Competing with other students made studying fun and engaging.",
    avatar: "JW"
  },
  {
    id: 6,
    name: "Alex Thompson",
    score: 1580,
    university: "Columbia University",
    text: "Incredible platform! The targeted weakness drills helped me go from 1200 to 1580 in just 3 months. Worth every penny!",
    avatar: "AT"
  },
  {
    id: 7,
    name: "Maya Patel",
    score: 1570,
    university: "University of Chicago",
    text: "The personalized study plans were perfect for my schedule. I could study efficiently without wasting time on topics I already knew.",
    avatar: "MP"
  },
  {
    id: 8,
    name: "Ryan O'Connor",
    score: 1560,
    university: "Duke University",
    text: "The video explanations and step-by-step solutions were incredibly helpful. I finally understood the math concepts that had confused me.",
    avatar: "RO"
  }
];

const UserReviews: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            What Our Students Say
          </h3>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of students who have achieved their dream SAT scores with our platform
          </p>
        </div>

        {/* Reviews Container */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling Reviews */}
          <div className="overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex space-x-4 sm:space-x-6 pb-4 auto-scroll" style={{ width: 'max-content' }}>
              {/* Duplicate reviews for seamless loop */}
              {[...reviews, ...reviews].map((review, index) => (
                <Card key={`${review.id}-${index}`} className="flex-shrink-0 w-80 sm:w-96 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 group">
                  <CardContent className="p-6">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                        <Quote className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    
                    {/* Review Text */}
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 text-center italic">
                      "{review.text}"
                    </p>
                    
                    {/* User Info */}
                    <div className="flex items-center justify-center space-x-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {review.avatar}
                      </div>
                      
                      {/* User Details */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">{review.name}</p>
                        <p className="text-blue-600 font-medium text-xs">{review.score} SAT Score</p>
                        <p className="text-gray-500 text-xs">{review.university}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <div className="flex space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            </div>
            <span className="font-medium text-sm sm:text-base">4.9/5 average rating from 10,000+ students</span>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .auto-scroll {
          animation: scroll 60s linear infinite;
        }
        
        .auto-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default UserReviews;
