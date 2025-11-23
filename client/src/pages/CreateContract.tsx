import { useState, useEffect } from 'react';
import { useLocation, Link, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { createContractSchema, type CreateContractInput } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Property, User } from '@shared/schema';

export default function CreateContract() {
  const params = useParams();
  const propertyId = params.propertyId ? parseInt(params.propertyId) : null;
  const [, setLocation] = useLocation();
  const { isOwner } = useAuth();
  const [error, setError] = useState<string>('');

  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: ['/properties', propertyId],
    enabled: !!propertyId,
  });

  const { data: students } = useQuery<User[]>({
    queryKey: ['/users/students'],
    enabled: isOwner,
  });

  const form = useForm<CreateContractInput>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      property_id: propertyId || 0,
      student_id: 0,
      start_date: '',
      end_date: '',
      monthly_rent: property?.price || 0,
      deposit_amount: property?.price ? property.price * 3 : 0,
    },
  });

  useEffect(() => {
    if (property) {
      form.setValue('monthly_rent', property.price);
      form.setValue('deposit_amount', property.price * 3);
    }
  }, [property]);

  const createContractMutation = useMutation({
    mutationFn: (data: CreateContractInput) => {
      return apiRequest('POST', '/contracts', data);
    },
    onSuccess: (data: { contract_id: number }) => {
      setLocation(`/contracts/${data.contract_id}`);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create contract');
    },
  });

  const onSubmit = (data: CreateContractInput) => {
    setError('');
    createContractMutation.mutate(data);
  };

  if (!isOwner) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Only property owners can create contracts</p>
          <Link href="/">
            <Button data-testid="button-home">Go Home</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (propertyLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading property details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!property) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Link href="/dashboard/owner">
            <Button data-testid="button-dashboard">Back to Dashboard</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard/owner">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Rental Contract</CardTitle>
              <CardDescription>
                Create a new rental contract for {property.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6 p-4 bg-muted rounded-md">
                <h3 className="font-semibold mb-2">Property Details</h3>
                <p className="text-sm text-muted-foreground">{property.title}</p>
                <p className="text-sm text-muted-foreground">
                  {property.address}, {property.city_name}
                </p>
                <p className="font-semibold mt-2">CHF {property.price.toLocaleString()}/month</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Tenant</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-student">
                              <SelectValue placeholder="Choose a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students?.map((student) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.first_name} {student.last_name} ({student.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the student who will rent this property
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-end-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthly_rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent (CHF)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-monthly-rent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deposit_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deposit Amount (CHF)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-deposit"
                            />
                          </FormControl>
                          <FormDescription>
                            Typically 3 months rent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={createContractMutation.isPending}
                      className="flex-1"
                      data-testid="button-submit"
                    >
                      {createContractMutation.isPending ? 'Creating...' : 'Create Contract'}
                    </Button>
                    <Link href="/dashboard/owner">
                      <Button type="button" variant="outline" size="lg" data-testid="button-cancel">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
