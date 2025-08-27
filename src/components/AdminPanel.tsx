
import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SecurityMonitor } from './Security/SecurityMonitor';
import { AuthSecuritySettings } from './Security/AuthSecuritySettings';
import { useSecureAdminAccess } from '@/hooks/useSecureAdminAccess';

export default function AdminPanel() {
  const { isAdmin, loading, logSecurityEvent } = useSecureAdminAccess();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          You are not authorized to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  useEffect(() => {
    if (isAdmin) {
      logSecurityEvent('admin_panel_accessed', {
        timestamp: new Date().toISOString()
      });
    }
  }, [isAdmin, logSecurityEvent]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Badge variant="outline" className="text-red-600">
          Admin Access
        </Badge>
      </div>

      {/* Add security sections at the top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityMonitor />
        <AuthSecuritySettings />
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>View and manage user accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>A list of all registered users.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">1</TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john.doe@example.com</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost">Edit</Button>
                    <Button variant="destructive">Delete</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">2</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>jane.smith@example.com</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost">Edit</Button>
                    <Button variant="destructive">Delete</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Content Management</h2>
        <Card>
          <CardHeader>
            <CardTitle>Question Bank</CardTitle>
            <CardDescription>Manage questions and answers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Here you can add, edit, and delete questions.</p>
            <Button>Add Question</Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>View site analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Here you can see site analytics.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
