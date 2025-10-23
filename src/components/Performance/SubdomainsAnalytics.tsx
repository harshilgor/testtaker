import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, ArrowUpRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface SubdomainsAnalyticsProps {
  subject: 'all' | 'math' | 'reading_writing';
}

interface SubdomainData {
  subdomain: string;
  correct: number;
  total: number;
  accuracy: number;
}

const SubdomainsAnalytics: React.FC<SubdomainsAnalyticsProps> = ({ subject }) => {
  const { questionAttempts } = useData();
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const { domains, subdomainsData } = useMemo(() => {
    if (!questionAttempts || !Array.isArray(questionAttempts) || questionAttempts.length === 0) {
      return { domains: [], subdomainsData: [] };
    }

    // Filter attempts by selected subject
    const filteredAttempts = questionAttempts.filter(attempt => {
      if (subject === 'all') return true;
      
      const testField = attempt.test || attempt.assessment || '';
      if (subject === 'math') {
        return testField.toLowerCase().includes('math');
      } else if (subject === 'reading_writing') {
        return testField.toLowerCase().includes('reading') || testField.toLowerCase().includes('writing');
      }
      return true;
    });

    if (filteredAttempts.length === 0) {
      return { domains: [], subdomainsData: [] };
    }

    // Get unique domains
    const domainSet = new Set<string>();
    filteredAttempts.forEach(attempt => {
      const domain = attempt.domain || attempt.category || 'Unknown';
      domainSet.add(domain);
    });
    const domains = Array.from(domainSet);

    // Filter by selected domain if one is selected
    const domainFilteredAttempts = selectedDomain 
      ? filteredAttempts.filter(attempt => (attempt.domain || attempt.category || 'Unknown') === selectedDomain)
      : filteredAttempts;

    // Group by subdomain
    const subdomainStats = domainFilteredAttempts.reduce((acc, attempt) => {
      const subdomain = attempt.subdomain || attempt.subcategory || attempt.topic || 'General';
      
      if (!acc[subdomain]) {
        acc[subdomain] = { correct: 0, total: 0 };
      }
      
      acc[subdomain].total++;
      if (attempt.is_correct) {
        acc[subdomain].correct++;
      }
      
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const subdomainsData: SubdomainData[] = Object.entries(subdomainStats).map(([subdomain, stats]) => ({
      subdomain,
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    }));

    return { domains, subdomainsData };
  }, [questionAttempts, subject, selectedDomain]);

  const getSubjectTitle = () => {
    if (subject === 'math') return 'Math Subdomains';
    if (subject === 'reading_writing') return 'Reading and Writing Subdomains';
    return 'Subdomains';
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {getSubjectTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Domain Selection */}
        <div className="mb-6">
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Domain: Select..." />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subdomains Content */}
        {selectedDomain ? (
          <div className="space-y-4">
            {subdomainsData.map((item) => (
              <div key={item.subdomain} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{item.subdomain}</span>
                  <span className="text-sm text-gray-600">
                    {item.correct} Correct • {item.total} Total
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-pink-300"
                    style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-red-600">
                  {item.accuracy.toFixed(0)}%
                </div>
              </div>
            ))}
            
            {subdomainsData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No subdomain data available for this domain</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              Click a domain on the left to expand data into its subdomains.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubdomainsAnalytics;
