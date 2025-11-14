import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, Home, MessageSquare, Clock, User, Stethoscope, ClipboardList, Plus, Pencil, Trash2 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  date: string;
  time: string;
  patientName: string;
  doctor: string;
  symptoms: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
}

const appointmentSchema = z.object({
  date: z.date({
    required_error: "Please select a date for the appointment",
  }),
  time: z.string().min(1, "Please select a time"),
  patientName: z.string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(100, "Patient name must be less than 100 characters"),
  doctor: z.string().min(1, "Please select a doctor"),
  symptoms: z.string()
    .trim()
    .min(5, "Please describe symptoms (at least 5 characters)")
    .max(500, "Symptoms description must be less than 500 characters"),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const doctors = [
  "Dr. Smith",
  "Dr. Johnson",
  "Dr. Williams",
  "Dr. Brown",
  "Dr. Davis",
  "Dr. Miller",
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 10, 15));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<{ [key: string]: Appointment[] }>({
    "2025-11-15": [
      { id: "APT001", date: "2025-11-15", time: "09:00 AM", patientName: "John Doe", doctor: "Dr. Smith", symptoms: "Fever, Headache", status: "confirmed" },
      { id: "APT002", date: "2025-11-15", time: "02:30 PM", patientName: "Jane Smith", doctor: "Dr. Johnson", symptoms: "Cough", status: "pending" }
    ]
  });

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: selectedDate,
      time: "",
      patientName: "",
      doctor: "",
      symptoms: "",
    },
  });

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    form.reset({
      date: parse(appointment.date, "yyyy-MM-dd", new Date()),
      time: appointment.time,
      patientName: appointment.patientName,
      doctor: appointment.doctor,
      symptoms: appointment.symptoms,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setDeletingAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingAppointment) return;

    const dateStr = deletingAppointment.date;
    setAppointments(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter(apt => apt.id !== deletingAppointment.id),
    }));

    toast({
      title: "Appointment Deleted",
      description: `Appointment for ${deletingAppointment.patientName} has been deleted.`,
      variant: "destructive",
    });

    setDeleteDialogOpen(false);
    setDeletingAppointment(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAppointment(null);
    form.reset({
      date: selectedDate,
      time: "",
      patientName: "",
      doctor: "",
      symptoms: "",
    });
  };

  const onSubmit = (data: AppointmentFormValues) => {
    const dateStr = format(data.date, "yyyy-MM-dd");

    if (editingAppointment) {
      // Update existing appointment
      const oldDateStr = editingAppointment.date;
      
      setAppointments(prev => {
        const updated = { ...prev };
        
        // Remove from old date
        updated[oldDateStr] = updated[oldDateStr].filter(apt => apt.id !== editingAppointment.id);
        
        // Add to new date
        const updatedAppointment: Appointment = {
          ...editingAppointment,
          date: dateStr,
          time: data.time,
          patientName: data.patientName,
          doctor: data.doctor,
          symptoms: data.symptoms,
        };
        
        updated[dateStr] = [...(updated[dateStr] || []), updatedAppointment].sort((a, b) => {
          const timeA = new Date(`2000-01-01 ${a.time}`).getTime();
          const timeB = new Date(`2000-01-01 ${b.time}`).getTime();
          return timeA - timeB;
        });

        return updated;
      });

      toast({
        title: "Appointment Updated",
        description: `Appointment for ${data.patientName} has been updated successfully.`,
      });
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        id: `APT${String(Date.now()).slice(-6)}`,
        date: dateStr,
        time: data.time,
        patientName: data.patientName,
        doctor: data.doctor,
        symptoms: data.symptoms,
        status: "pending",
      };

      setAppointments(prev => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), newAppointment].sort((a, b) => {
          const timeA = new Date(`2000-01-01 ${a.time}`).getTime();
          const timeB = new Date(`2000-01-01 ${b.time}`).getTime();
          return timeA - timeB;
        }),
      }));

      toast({
        title: "Appointment Created",
        description: `Appointment for ${data.patientName} has been scheduled successfully.`,
      });
    }

    setSelectedDate(data.date);
    handleDialogClose();
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants = {
      pending: "secondary" as const,
      confirmed: "default" as const,
      cancelled: "destructive" as const,
      completed: "outline" as const,
      no_show: "secondary" as const
    };
    return variants[status as keyof typeof variants] || "default";
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Appointments</h1>
          </div>
          <nav className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/chatbot">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          {/* Calendar Card */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Date</CardTitle>
              <CardDescription className="text-sm">
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Choose a date"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
                modifiers={{
                  hasAppointments: (date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return !!appointments[dateStr];
                  }
                }}
                modifiersClassNames={{
                  hasAppointments: "font-bold relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                }}
              />
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    {selectedDateStr && appointments[selectedDateStr] 
                      ? `${appointments[selectedDateStr].length} Appointment${appointments[selectedDateStr].length !== 1 ? 's' : ''}`
                      : "Appointments"}
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    {selectedDate ? `Schedule for ${format(selectedDate, "EEEE, MMMM d")}` : "Select a date to view appointments"}
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  if (!open) handleDialogClose();
                  else setDialogOpen(true);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingAppointment ? "Edit Appointment" : "Create New Appointment"}</DialogTitle>
                      <DialogDescription>
                        {editingAppointment ? "Update the appointment details below." : "Fill in the details to schedule a new appointment."}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Appointment Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select time slot" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-popover z-50">
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="patientName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter patient name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="doctor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Doctor</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select a doctor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-popover z-50">
                                  {doctors.map((doctor) => (
                                    <SelectItem key={doctor} value={doctor}>
                                      {doctor}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="symptoms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Symptoms</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe symptoms and reason for visit"
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-2">
                          <Button type="submit" className="flex-1">
                            {editingAppointment ? "Update Appointment" : "Create Appointment"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleDialogClose}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">Select a date to view appointments</p>
                  </div>
                ) : selectedDateStr && appointments[selectedDateStr] ? (
                  <div className="space-y-3">
                    {appointments[selectedDateStr].map((apt) => (
                      <Card key={apt.id} className="overflow-hidden border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{apt.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusVariant(apt.status)} className="text-xs">
                                {apt.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(apt)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(apt)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div>
                                <p className="text-muted-foreground text-xs">Patient</p>
                                <p className="font-medium">{apt.patientName}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div>
                                <p className="text-muted-foreground text-xs">Doctor</p>
                                <p className="font-medium">{apt.doctor}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div>
                                <p className="text-muted-foreground text-xs">Symptoms</p>
                                <p className="text-muted-foreground">{apt.symptoms}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t">
                              <span className="text-xs font-mono text-muted-foreground">ID: {apt.id}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">No appointments scheduled</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the appointment for{" "}
              <span className="font-semibold">{deletingAppointment?.patientName}</span> on{" "}
              <span className="font-semibold">
                {deletingAppointment?.date && format(parse(deletingAppointment.date, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")}
              </span>{" "}
              at <span className="font-semibold">{deletingAppointment?.time}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingAppointment(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Calendar;
