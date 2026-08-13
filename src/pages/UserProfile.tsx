import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { ArrowLeft, User, Mail, Calendar, BarChart, LogOut } from 'lucide-react';
import { PageProps } from '../App';

interface UserProfileProps extends PageProps {}

export default function UserProfile({ onNavigate }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button variant="destructive" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="shrink-0">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-32 h-32 rounded-full ring-4 ring-primary/20 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {user.user_metadata?.full_name || 'Student'}
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                CEFR Target: B2
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-muted-foreground justify-center md:justify-start">
                <Mail className="w-5 h-5" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground justify-center md:justify-start">
                <Calendar className="w-5 h-5" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mock Stats Cards */}
          <div className="bg-card rounded-2xl p-6 border border-border flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
              <BarChart className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">12</h3>
            <p className="text-sm text-muted-foreground">Tests Completed</p>
          </div>
          
          <div className="bg-card rounded-2xl p-6 border border-border flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
              <span className="font-bold text-lg">B1+</span>
            </div>
            <h3 className="text-2xl font-bold">Estimated Level</h3>
            <p className="text-sm text-muted-foreground">Based on recent scores</p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
              <span className="font-bold text-lg">85%</span>
            </div>
            <h3 className="text-2xl font-bold">Accuracy</h3>
            <p className="text-sm text-muted-foreground">Overall success rate</p>
          </div>
        </div>

        {/* Data "Folder" Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-xl font-semibold">My Learning Folder</h2>
            <p className="text-sm text-muted-foreground mt-1">Your saved test results and historical data.</p>
          </div>
          <div className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 opacity-50" />
              </div>
              <p>Your test history will appear here once you complete an exam.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
