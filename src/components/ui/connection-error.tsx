'use client';

import { AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useState } from 'react';

export function ConnectionError() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="w-full max-w-md mx-auto mt-8 shadow-lg border-red-200">
      <CardHeader className="bg-red-50">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-700">Database Connection Error</CardTitle>
        </div>
        <CardDescription>
          FloraFind couldn't connect to the database
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <Alert variant="destructive">
          <AlertTitle className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Missing Configuration
          </AlertTitle>
          <AlertDescription className="mt-2">
            Supabase environment variables are not properly configured.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm">To resolve this issue:</p>
          <ol className="text-sm list-decimal list-inside space-y-2">
            <li>Create a <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file in your project root</li>
            <li>Add your Supabase URL and anon key:</li>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono mt-2">
              NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
            </div>
            <li>Restart the development server</li>
          </ol>
        </div>
        
        <Button 
          onClick={() => setShowDetails(!showDetails)} 
          variant="outline" 
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </Button>
        
        {showDetails && (
          <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-48">
            <p className="font-medium mb-2">Environment Status:</p>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify({
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing',
                NODE_ENV: process.env.NODE_ENV,
              }, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 