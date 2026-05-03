"use client";

import { useState, useEffect } from "react";
import { getUsers } from "@/actions/audit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Mail, 
  Shield, 
  CheckCircle2, 
  ListTodo,
  ArrowRight
} from "lucide-react";

type UserWithStats = {
  id: string;
  name: string;
  email: string;
  role: string;
  tasksCount: number;
  doneTasksCount: number;
};

export default function TeamPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data as UserWithStats[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your project collaborators.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const completionRate = user.tasksCount > 0 
              ? Math.round((user.doneTasksCount / user.tasksCount) * 100) 
              : 0;

            return (
              <Card key={user.id} className="border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {user.name.charAt(0)}
                    </div>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider">
                      {user.role}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{user.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Tasks</p>
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-bold">{user.tasksCount}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Completed</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-bold">{user.doneTasksCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">{completionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
