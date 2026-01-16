import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  Bell,
  X,
  CheckCircle,
  Play,
  User,
} from "lucide-react";
import {
  getHours,
  getMinutes,
  format,
  addDays,
  isSameDay,
  subDays,
  startOfToday,
} from "date-fns";
import { useTheme } from "../../providers/ThemeProvider";
import Breadcrumbs from "../../components/Breadcrumbs";
import ContextPopover from "../../components/ContextPopover";

const generateMockAppointments = (date) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const todayStr = format(new Date(), "yyyy-MM-dd");
  if (dateStr !== todayStr) return [];
  return [
    {
      id: 1,
      timeSlot: "09:00 AM - 10:00 AM",
      startTime: 9,
      totalPatients: 3,
      hasActive: true,
      patients: [
        {
          id: 101,
          name: "Alice Johnson",
          time: "09:15",
          status: "In Consultation",
          color: "bg-amber-500",
        },
        {
          id: 102,
          name: "Robert Smith",
          time: "09:30",
          status: "Waiting in Hall",
          color: "bg-indigo-500",
        },
      ],
    },
    {
      id: 2,
      timeSlot: "11:00 AM - 12:00 PM",
      startTime: 11,
      totalPatients: 5,
      hasActive: false,
      patients: [
        {
          id: 201,
          name: "Sarah Connor",
          time: "11:00",
          status: "Coming later",
          color: "bg-emerald-500",
        },
      ],
    },
  ];
};

const AppointmentModal = ({ isOpen, onClose, group }) => {
  if (!isOpen || !group) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative card-base w-full max-w-lg overflow-hidden animate-in zoom-in-95 shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-primary-600 tracking-widest">
                Time Slot
              </span>
              <span className="text-[10px] font-black text-zinc-500">
                {group.timeSlot}
              </span>
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white">
              Patients for this Time
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto app-scrollbar">
          {group.patients.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 group/item hover:border-primary-500/30 transition-all cursor-context-menu"
              data-context-type="patient"
              data-context-name={p.name}
              data-context-id={p.id}
            >
              <div className="flex items-center gap-4">
                <div className={p.color + " w-3 h-3 rounded-full shadow-sm"} />
                <ContextPopover
                  type="patient"
                  data={{ name: p.name, id: p.id }}
                >
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-help">
                    {p.name}
                  </span>
                </ContextPopover>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-tight text-zinc-500">
                  {p.status}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  At {p.time}
                </span>
              </div>
            </div>
          ))}
          {group.patients.length === 0 && (
            <p className="text-center py-8 text-zinc-500 font-bold italic">
              No patients registered for this hour.
            </p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button className="button-primary px-8 py-2.5" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const scrollContainerRef = useRef(null);
  const dateStripRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const appointments = generateMockAppointments(selectedDate);
  const dates = Array.from({ length: 30 }, (_, i) =>
    addDays(subDays(startOfToday(), 2), i),
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isSameDay(selectedDate, new Date()) && scrollContainerRef.current) {
      const hour = getHours(new Date());
      scrollContainerRef.current.scrollTo({
        top: hour * 80 - 150,
        behavior: "smooth",
      });
    }
  }, [selectedDate]);

  const scrollDates = (dir) => {
    if (dateStripRef.current) {
      dateStripRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    return getHours(now) * 80 + getMinutes(now) * (80 / 60) + 20;
  };

  return (
    <div className="card flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs
              items={[{ label: "Doctor" }, { label: "My Patients Today" }]}
            />
            <h1 className="heading-1 font-black">Daily Schedule</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock size={12} className="text-zinc-400" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {format(selectedDate, "MMMM yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isSameDay(selectedDate, new Date()) && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-500/10 px-6 py-2 rounded-xl border border-primary-500/20 hover:bg-primary-500/20 transition-all"
              >
                Go to Today
              </button>
            )}
          </div>
        </div>

        <div className="relative w-full border-t border-zinc-100 dark:border-zinc-800 py-4 group">
          <button
            onClick={() => scrollDates("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 flex items-center justify-start pl-2 text-zinc-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            ref={dateStripRef}
            className="flex overflow-x-auto no-scrollbar gap-2 px-6 scroll-smooth"
          >
            {dates.map((d, i) => {
              const isSelected = isSameDay(d, selectedDate);
              const isToday = isSameDay(d, new Date());
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 relative w-[56px] h-[68px] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border select-none 
                           ${
                             isSelected
                               ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20 scale-105 z-10"
                               : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-primary-500/30"
                           }`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? "text-white/80" : "text-zinc-500"}`}
                  >
                    {format(d, "EEE")}
                  </span>
                  <span className="text-xl font-black leading-none">
                    {format(d, "d")}
                  </span>
                  {isToday && !isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollDates("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 flex items-center justify-end pr-2 text-zinc-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* TIMELINE */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative bg-zinc-50 dark:bg-transparent app-scrollbar"
      >
        <div
          className="relative w-full pb-32 pt-8"
          style={{ height: "2000px" }}
        >
          {/* Grid Lines */}
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className="flex w-full absolute pointer-events-none px-6"
              style={{ top: h * 80 + 20, height: 80 }}
            >
              <div className="w-20 flex-shrink-0 -mt-2.5">
                <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
                  {h === 0
                    ? "Midnight"
                    : h === 12
                      ? "Noon"
                      : (h % 12) + (h >= 12 ? " PM" : " AM")}
                </span>
              </div>
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800 border-dashed"></div>
            </div>
          ))}

          {/* Current Time Line */}
          {isSameDay(selectedDate, new Date()) && (
            <div
              className="absolute w-full z-20 pointer-events-none flex items-center px-6"
              style={{ top: getCurrentTimePosition() }}
            >
              <div className="w-20 flex justify-start -ml-2">
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg shadow-rose-500/20">
                  {format(currentTime, "hh:mm a")}
                </span>
              </div>
              <div className="flex-1 h-px bg-rose-500 relative">
                <div className="absolute -left-1 -top-[4px] w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
              </div>
            </div>
          )}

          {/* Appointment Cards */}
          {appointments.map((appt) => (
            <div
              key={appt.id}
              onClick={() => {
                setSelectedGroup(appt);
                setModalOpen(true);
              }}
              className="absolute left-28 right-8 z-10 cursor-pointer group"
              style={{ top: appt.startTime * 80 + 20, height: 80 }}
            >
              <div
                className={`h-full w-full rounded-2xl border transition-all p-5 flex items-center justify-between shadow-sm group-hover:shadow-xl group-hover:scale-[1.01] active:scale-[0.99]
                     ${
                       appt.hasActive
                         ? "bg-amber-500/10 border-amber-500/40 dark:bg-amber-900/10"
                         : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md"
                     }`}
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`w-2 h-12 rounded-full ${appt.hasActive ? "bg-amber-500" : "bg-primary-500"}`}
                  />
                  <div className="flex flex-col">
                    <span className="font-black text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
                      {appt.timeSlot}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <User size={12} className="text-zinc-400" />
                      <span className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 capitalize">
                        {appt.totalPatients} Patients in line
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {appt.hasActive && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse tracking-widest">
                      DR. BUSY
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <ChevronRight
                      className="transition-all"
                      size={20}
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        group={selectedGroup}
      />
    </div>
  );
}
