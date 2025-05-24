
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, BookOpen, ChevronRight } from 'lucide-react';
import { Subject } from '../pages/Index';

interface AllContentProps {
  userName: string;
  selectedSubject: Subject | null;
  selectedTopic: string | null;
  onSubjectSelect: (subject: Subject) => void;
  onTopicSelect: (topic: string) => void;
  onBack: () => void;
}

const mathTopics = [
  {
    category: "Algebra",
    topics: [
      "Linear equations in one variable",
      "Linear equations in two variables", 
      "Linear inequalities",
      "Systems of linear equations and inequalities",
      "Solving equations using substitution and elimination",
      "Word problems involving linear relationships"
    ]
  },
  {
    category: "Advanced Math",
    topics: [
      "Quadratic equations (factoring, completing the square, quadratic formula)",
      "Exponential equations and functions",
      "Rational expressions and equations",
      "Radical equations",
      "Polynomials: operations and factoring",
      "Solving nonlinear equations",
      "Function notation and analysis",
      "Inverse functions",
      "Creating and interpreting functions from real-world contexts"
    ]
  },
  {
    category: "Problem Solving and Data Analysis",
    topics: [
      "Ratios, rates, and proportions",
      "Units and unit conversion",
      "Percentages (including percent change, markup/discount, and percent increase/decrease)",
      "Descriptive statistics (mean, median, mode, range, standard deviation)",
      "Interpreting graphs and tables",
      "Scatterplots and trend lines",
      "Probability",
      "Data collection and bias"
    ]
  },
  {
    category: "Geometry and Trigonometry",
    topics: [
      "Area and volume (triangles, circles, cylinders, spheres, prisms)",
      "Pythagorean Theorem and distance formula",
      "Angles, triangles, and circle theorems",
      "Sine, cosine, and tangent ratios",
      "Right triangle trigonometry",
      "Coordinate geometry"
    ]
  }
];

const englishTopics = [
  {
    category: "Information and Ideas",
    topics: [
      "Main idea and central claim",
      "Inference based on textual evidence",
      "Understanding relationships between ideas",
      "Interpreting graphs, charts, and data in context"
    ]
  },
  {
    category: "Craft and Structure",
    topics: [
      "Meaning of words in context",
      "Author's purpose and tone",
      "Analyzing structure and rhetorical strategies"
    ]
  },
  {
    category: "Expression of Ideas (Writing)",
    topics: [
      "Revising for clarity, conciseness, and relevance",
      "Improving transitions and organization",
      "Combining and rearranging sentences",
      "Development of ideas within paragraphs"
    ]
  },
  {
    category: "Standard English Conventions",
    topics: [
      "Subject-verb agreement",
      "Pronoun clarity and agreement",
      "Modifier placement",
      "Verb tense and form",
      "Parallel structure",
      "Commas, colons, and semicolons",
      "Apostrophes (possessives)",
      "Sentence boundaries (fragments, run-ons, comma splices)"
    ]
  }
];

const AllContent: React.FC<AllContentProps> = ({ 
  userName, 
  selectedSubject, 
  selectedTopic,
  onSubjectSelect, 
  onTopicSelect,
  onBack 
}) => {
  if (!selectedSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="mb-4 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              All Content
            </h1>
            <p className="text-lg text-gray-600">
              Choose your subject to explore specific topics, {userName}!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-center">
                <div className="bg-green-50 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Calculator className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mathematics</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Explore algebra, geometry, statistics, and advanced math concepts by topic
                </p>
                
                <Button
                  onClick={() => onSubjectSelect('math')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-medium"
                >
                  Explore Math Topics
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-center">
                <div className="bg-indigo-50 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">English</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Master reading comprehension, writing skills, and language usage by topic
                </p>
                
                <Button
                  onClick={() => onSubjectSelect('english')}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 text-lg font-medium"
                >
                  Explore English Topics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topics = selectedSubject === 'math' ? mathTopics : englishTopics;
  const subjectName = selectedSubject === 'math' ? 'Mathematics' : 'English';
  const subjectColor = selectedSubject === 'math' ? 'green' : 'indigo';

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => onSubjectSelect(null as any)}
            variant="outline"
            className="mb-4 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {subjectName} Topics
          </h1>
          <p className="text-lg text-gray-600">
            Select a specific topic to practice
          </p>
        </div>

        <div className="space-y-6">
          {topics.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">{category.category}</h3>
              </div>
              <div className="p-4">
                <div className="grid gap-2">
                  {category.topics.map((topic, topicIndex) => (
                    <button
                      key={topicIndex}
                      onClick={() => onTopicSelect(topic)}
                      className="flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-md transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-gray-900">{topic}</span>
                      <ChevronRight className={`h-4 w-4 text-${subjectColor}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllContent;
