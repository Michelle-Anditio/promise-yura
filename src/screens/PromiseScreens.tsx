import React from "react";
import { motion } from "motion/react";
import { Calendar, Clock, Sparkles, Trash2, CheckCircle2, ChevronRight, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Chip } from "../components/ui/Chip";
import { Input } from "../components/ui/Input";
import { ScreenLayout } from "../components/layout/ScreenLayout";
import { YuraBubble } from "../components/promise/YuraBubble";
import { PromiseCard } from "../components/promise/PromiseCard";
import { YuraMascot } from "../components/brand/YuraMascot";
import { PromiseItem } from "../types";

const getTodayLocalDateStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ============================================================================
// 1. MY PROMISES SCREEN (Vault)
// ============================================================================
interface MyPromisesScreenProps {
  filteredPromises: PromiseItem[];
  promiseFilter: "All" | "Today" | "Needs detail" | "Done";
  setPromiseFilter: (filter: "All" | "Today" | "Needs detail" | "Done") => void;
  onEdit: (id: string) => void;
  onAddDetails: (id: string) => void;
  onCheckIn: (id: string) => void;
  onEditDateTime?: (id: string) => void;
  onChangeTab: (tab: string) => void;
}

export const MyPromisesScreen: React.FC<MyPromisesScreenProps> = ({
  filteredPromises,
  promiseFilter,
  setPromiseFilter,
  onEdit,
  onAddDetails,
  onCheckIn,
  onEditDateTime,
  onChangeTab,
}) => {
  return (
    <motion.div
      key="MyPromises"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout
        headerProps={{
          title: "My Promises",
          actionType: "settings",
          onAction: () => onChangeTab("profile"),
        }}
        bottomNavProps={{
          activeTab: "promises",
          onChangeTab: (tab) => {
            if (tab === "add") onChangeTab("add");
            else if (tab === "home") onChangeTab("home");
            else if (tab === "history") onChangeTab("history");
            else if (tab === "profile") onChangeTab("profile");
          },
        }}
      >
        <div className="space-y-5 max-w-md mx-auto pb-10">
          <div className="w-full">
            <p className="text-sm font-semibold text-on-surface-variant opacity-80 mt-1">
              Everything Yura is helping you keep.
            </p>
          </div>

          {/* Filters horizontal view scrolling */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide select-none">
            {(["All", "Today", "Needs detail", "Done"] as const).map((filter) => (
              <Chip
                key={filter}
                label={filter}
                active={promiseFilter === filter}
                onClick={() => setPromiseFilter(filter)}
              />
            ))}
          </div>

          {/* Grid stats active segment header */}
          <section className="space-y-4">
            <div className="flex items-center justify-between select-none">
              <h2 className="text-base font-extrabold uppercase tracking-wider text-primary">Active Vault</h2>
              <Badge color="primary">{filteredPromises.length} total</Badge>
            </div>

            {filteredPromises.length === 0 ? (
              <Card className="glass-card text-center p-8 py-10 flex flex-col items-center select-none">
                <HelpCircle className="w-10 h-10 text-primary mb-2" />
                <p className="font-bold text-sm text-on-surface">No matching promises inside</p>
                <p className="text-xs text-on-surface-variant mt-1">Try catching some voice goals!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPromises.map((p) => (
                  <PromiseCard
                    key={p.id}
                    title={p.title}
                    dateStr={p.dateStr}
                    timeStr={p.timeStr}
                    dueAt={p.dueAt}
                    priority={p.priority}
                    status={p.status}
                    onEdit={() => onEdit(p.id)}
                    onAddDetails={() => onAddDetails(p.id)}
                    onCheckIn={() => onCheckIn(p.id)}
                    onEditDateTime={onEditDateTime ? () => onEditDateTime(p.id) : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Ambient descriptive Yura nudges container card block */}
          <section className="pt-2 select-none">
            <div className="bg-primary-fixed/30 rounded-2xl p-5 flex items-start gap-4 border border-primary-container/20 relative overflow-hidden">
              <YuraMascot mood="supportive" size="xs" className="flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary">Yura’s nudge mode</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  “I’ll keep reminding you until you check in.”
                </p>
              </div>
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-primary-container/20 rounded-full blur-xl animate-none" />
            </div>
          </section>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 2. EDIT PROMISE SCREEN
// ============================================================================
interface EditPromiseScreenProps {
  editTitle: string;
  setEditTitle: (t: string) => void;
  editDate: string;
  setEditDate: (d: string) => void;
  editTime: string;
  setEditTime: (t: string) => void;
  editPriority: "Low" | "Medium" | "High";
  setEditPriority: (p: "Low" | "Medium" | "High") => void;
  editNotes: string;
  setEditNotes: (n: string) => void;
  editIntensity: "Gentle" | "Normal" | "Annoying";
  setEditIntensity: (i: "Gentle" | "Normal" | "Annoying") => void;
  editCategory: string;
  setEditCategory: (c: string) => void;
  onSave: () => void;
  onDismiss: () => void;
  onBack: () => void;
}

export const EditPromiseScreen: React.FC<EditPromiseScreenProps> = ({
  editTitle,
  setEditTitle,
  editDate,
  setEditDate,
  editTime,
  setEditTime,
  editPriority,
  setEditPriority,
  editNotes,
  setEditNotes,
  editIntensity,
  setEditIntensity,
  editCategory,
  setEditCategory,
  onSave,
  onDismiss,
  onBack,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll container, window, body and document html elements to top on mount
    containerRef.current?.scrollTo({ top: 0 });
    window.scrollTo(0, 0);
    document.documentElement.scrollTo({ top: 0 });
    document.body.scrollTo({ top: 0 });

    // Also target and scroll any potential internal scrollable element containers
    const scrollableDivs = document.querySelectorAll(".overflow-y-auto, [style*='overflow']");
    scrollableDivs.forEach((el) => {
      el.scrollTo({ top: 0 });
    });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      key="EditPromise"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Edit Promise", onBack: onBack }}>
        <div className="space-y-5 max-w-md mx-auto pb-10">
          {/* Gentle helper alert bubble from Yura when fields are missing */}
          {(editDate === "" || editTime === "") ? (
            <div className="bg-primary/5 border border-primary/10 p-4.5 rounded-2xl flex items-center gap-4 animate-none select-none">
              <YuraMascot mood="question" size="xs" src="/yura-question.png" className="flex-shrink-0 animate-bounce duration-5000" />
              <div>
                <p className="text-sm font-extrabold text-primary">Yura still needs a time for this promise.</p>
                <p className="text-xs text-on-surface-variant/80 mt-0.5 font-medium">Please select a time slot or use suggestions below to save it.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Adjust the details before Yura saves it.</p>
          )}

          <div className="space-y-4">
            <Input
              label="Promise Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                min={getTodayLocalDateStr()}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                rightIcon={<Calendar className="w-4.5 h-4.5 text-primary pointer-events-none" />}
                className={editDate === "" ? "ring-2 ring-error/40 bg-error/5 focus:ring-primary" : ""}
                autoFocus={editDate === ""}
              />
              <Input
                label="Time"
                type="time"
                placeholder="No time set"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                rightIcon={<Clock className="w-4.5 h-4.5 text-primary pointer-events-none" />}
                className={editTime === "" ? "ring-2 ring-error/40 bg-error/5 focus:ring-primary" : ""}
                autoFocus={editDate !== "" && editTime === ""}
              />
            </div>

            {/* Smart suggestion chips for easy timezone selection */}
            {(editDate === "" || editTime === "") && (
              <div className="space-y-2 pt-1.5 select-none animate-none">
                <span className="block text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-widest px-4">⚡ Quick suggestions</span>
                <div className="flex flex-wrap gap-2 px-1">
                  {[
                    { label: "Tonight", time: "20:00", dateOffset: 0 },
                    { label: "Tomorrow morning", time: "09:00", dateOffset: 1 },
                    { label: "After class (4 PM)", time: "16:00", dateOffset: 0 },
                    { label: "Tonight (9 PM)", time: "21:00", dateOffset: 0 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        if (s.dateOffset > 0) {
                          d.setDate(d.getDate() + s.dateOffset);
                        }
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, "0");
                        const dayNum = String(d.getDate()).padStart(2, "0");
                        setEditDate(`${y}-${m}-${dayNum}`);
                        setEditTime(s.time);
                      }}
                      className="py-1.5 px-3 bg-neutral-creamMedium hover:bg-neutral-creamDark text-on-surface text-xs font-bold rounded-full transition-all border border-transparent shadow-sm hover:scale-102 cursor-pointer active:scale-98"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Toggles block */}
            <div className="space-y-2 select-none animate-none">
              <label className="block text-xs font-semibold px-4 text-on-surface-variant uppercase tracking-wider">Priority</label>
              <div className="flex p-1.5 bg-neutral-creamMedium rounded-2xl gap-1">
                {(["Low", "Medium", "High"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditPriority(p)}
                    className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                      editPriority === p
                        ? "bg-primary-container text-on-primary-container shadow-sm"
                        : "text-on-surface-variant hover:bg-white/20"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Note block text areas */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold px-4 text-on-surface-variant uppercase tracking-wider">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full min-h-[100px] p-4 text-sm rounded-xl bg-white border border-[#D8CCFF] font-sans text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all resize-none animate-none hover:border-[#b2a4ff]/60"
              />
            </div>

            {/* Reminder intensity standard ADHD scale choice */}
            <div className="space-y-2 select-none animate-none">
              <label className="block text-xs font-semibold px-4 text-on-surface-variant uppercase tracking-wider">Reminder intensity</label>
              <div className="flex p-1.5 bg-neutral-creamMedium rounded-2xl gap-1">
                {(["Gentle", "Normal", "Annoying"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEditIntensity(lvl)}
                    className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                      editIntensity === lvl
                        ? "bg-primary-container text-on-primary-container shadow-sm"
                        : "text-on-surface-variant hover:bg-white/20"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Category choice */}
            <div className="space-y-2 select-none animate-none">
              <label className="block text-xs font-semibold px-4 text-on-surface-variant uppercase tracking-wider">Category</label>
              <div className="flex p-1.5 bg-neutral-creamMedium rounded-2xl gap-1">
                {(["PROMISE", "TASK", "MEETING", "GOAL"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditCategory(cat)}
                    className={`flex-1 py-1.5 font-bold text-[11px] rounded-xl transition-all cursor-pointer ${
                      editCategory === cat
                        ? "bg-primary-container text-on-primary-container shadow-sm"
                        : "text-on-surface-variant hover:bg-white/20"
                    }`}
                  >
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Standby widget mascot details card */}
            <div className="bg-primary-fixed/40 p-4 rounded-xl flex items-start gap-4 select-none animate-none">
              <Sparkles className="text-primary w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-on-primary-fixed-variant">Yura is on standby</p>
                <p className="text-[11px] text-[#797582] mt-0.5">Yura will remind you gently based on intensity parameters.</p>
              </div>
            </div>
          </div>

          {/* Bottom Trigger button metrics */}
          <div className="space-y-3 pt-6 animate-none">
            <Button onClick={onSave} variant="primary" className="w-full h-15 bg-primary">
              Save changes
            </Button>
            <Button
              onClick={onDismiss}
              variant="ghost"
              className="w-full text-error font-bold flex items-center justify-center gap-1 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Dismiss Promise
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 3. CHECK-IN SCREEN
// ============================================================================
interface CheckInScreenProps {
  currentEditingId: string | null;
  promises: PromiseItem[];
  messageTone: "Sweet" | "Direct" | "Playful";
  onConfirmDone: () => void;
  onRemindLater: () => void;
  onGoToReschedule: () => void;
  onMarkMissed?: () => void;
  onBack: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({
  currentEditingId,
  promises,
  messageTone,
  onConfirmDone,
  onRemindLater,
  onGoToReschedule,
  onMarkMissed,
  onBack,
}) => {
  const checkItem = promises.find((p) => p.id === currentEditingId);
  const isOverdue = checkItem?.dueAt ? new Date(checkItem.dueAt).getTime() < Date.now() : false;

  return (
    <motion.div
      key="CheckIn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Promise check-in", onBack: onBack }}>
        <div className="space-y-6 max-w-sm mx-auto pb-10 flex flex-col items-center">
          <div className="text-center space-y-1 mt-2 select-none">
            <h2 className="text-2xl font-black text-on-surface">Time to check in</h2>
            <p className="text-sm font-semibold text-on-surface-variant opacity-80">Yura is here to help keep your promises fresh.</p>
          </div>

          {/* Details card check in info */}
          {checkItem && (
            <Card className="w-full p-6 text-left border-l-4 border-l-secondary-container">
              <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-secondary-fixed text-on-secondary-fixed-variant mb-2 select-none">Needs check-in</span>
              <h3 className="text-xl font-extrabold text-[#5f52a6] mb-1">{checkItem.title}</h3>
              <p className="text-xs text-[#797582] flex items-center gap-1 font-medium mt-1 select-none">
                <Clock className="w-3.5 h-3.5" />
                {checkItem.dateStr} at {checkItem.timeStr || "Anytime"}
              </p>
            </Card>
          )}

          {/* Yura message tone interaction bubble dialogue */}
          <YuraBubble text="Did you do this promise yet?" tone={messageTone.toLowerCase() as any} />

          {/* Choices Button segments */}
          <div className="w-full space-y-3 pt-4 animate-none">
            <Button
              onClick={onConfirmDone}
              variant="primary"
              className="w-full h-15 flex items-center justify-center gap-2 group bg-gradient-to-r from-primary to-primary-container"
              leftIcon={<CheckCircle2 className="w-5 h-5 font-bold" />}
            >
              Yes, I did it
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onRemindLater}
                variant="tertiary"
                className="py-3.5 h-13 text-xs"
                leftIcon={<Clock className="w-4 h-4 text-emerald-600" />}
              >
                Remind later
              </Button>
              <Button
                onClick={onGoToReschedule}
                variant="secondary"
                className="py-3.5 h-13 text-xs bg-secondary-container"
                leftIcon={<Clock className="w-4 h-4 text-secondary" />}
              >
                Reschedule
              </Button>
            </div>

            {isOverdue && onMarkMissed && (
              <Button
                onClick={onMarkMissed}
                variant="outline"
                className="w-full h-13 flex items-center justify-center gap-2 border border-rose-200 bg-rose-100/10 hover:bg-rose-100/40 text-[#ba1a1a] hover:text-[#ba1a1a] font-bold text-xs"
                leftIcon={<AlertCircle className="w-4 h-4 text-[#ba1a1a]" />}
              >
                I missed it
              </Button>
            )}
          </div>

          <p className="text-[11px] text-on-surface-variant text-center italic mt-4 opacity-75 select-none animate-none">
            Yura will keep nudging until you check-in, keeping visual focus intact.
          </p>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 4. RESCHEDULE SCREEN
// ============================================================================
interface RescheduleScreenProps {
  customTimeInput: string;
  setCustomTimeInput: (t: string) => void;
  onInstantReschedule: (dateStr: string, timeStr: string, status: "upcoming" | "needs detail") => void;
  onCustomReschedule: () => void;
  onBack: () => void;
}

export const RescheduleScreen: React.FC<RescheduleScreenProps> = ({
  customTimeInput,
  setCustomTimeInput,
  onInstantReschedule,
  onCustomReschedule,
  onBack,
}) => {
  return (
    <motion.div
      key="Reschedule"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Reschedule Promise", onBack: onBack }}>
        <div className="space-y-6 max-w-sm mx-auto pb-10">
          <div className="space-y-1 mt-2 select-none">
            <h2 className="text-2xl font-black text-[#7a5362]">Need some more time?</h2>
            <p className="text-sm font-semibold text-on-surface-variant">That's okay! We avoid productivity guilt.</p>
          </div>

          <YuraBubble text="When is a safe moment to resume this?" tone="sweet" />

          {/* Fast delay choose triggers */}
          <div className="grid grid-cols-2 gap-3 pt-2 select-none animate-none">
            <button
              onClick={() => onInstantReschedule("Tonight", "08:00 PM", "upcoming")}
              className="p-5 bg-white border border-neutral-creamDark rounded-2xl text-center font-bold text-sm shadow-sm active:scale-95 transition-all text-neutral-text hover:bg-[#b2a4ff]/8 select-none cursor-pointer"
            >
              <span className="block text-xl mb-1">🌙</span>
              Tonight
            </button>

            <button
              onClick={() => onInstantReschedule("Tomorrow", "09:00 AM", "upcoming")}
              className="p-5 bg-white border border-neutral-creamDark rounded-2xl text-center font-bold text-sm shadow-sm active:scale-95 transition-all text-neutral-text hover:bg-[#b2a4ff]/8 select-none cursor-pointer"
            >
              <span className="block text-xl mb-1">☀️</span>
              Tomorrow
            </button>

            <button
              onClick={() => onInstantReschedule("Next Week", "11:00 AM", "upcoming")}
              className="p-5 bg-white border border-neutral-creamDark rounded-2xl text-center font-bold text-sm shadow-sm active:scale-95 transition-all text-neutral-text hover:bg-[#b2a4ff]/8 select-none cursor-pointer"
            >
              <span className="block text-xl mb-1">📅</span>
              Next Week
            </button>

            <button
              onClick={() => onInstantReschedule("Someday", "", "needs detail")}
              className="p-5 bg-white border border-neutral-creamDark rounded-2xl text-center font-bold text-sm shadow-sm active:scale-95 transition-all text-neutral-text hover:bg-[#b2a4ff]/8 select-none cursor-pointer"
            >
              <span className="block text-xl mb-1">☁️</span>
              Someday
            </button>
          </div>

          <div className="pt-4">
            <Input
              label="Or type a specific date/time"
              placeholder="e.g. Wednesday at 4 PM"
              value={customTimeInput}
              onChange={(e) => setCustomTimeInput(e.target.value)}
            />
          </div>

          <div className="pt-6 animate-none font-semibold text-sm">
            <Button
              onClick={onCustomReschedule}
              variant="primary"
              className="w-full h-15 bg-primary"
            >
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 5. MISSED PROMISE SCREEN
// ============================================================================
interface MissedPromiseScreenProps {
  onCompleteLate: () => void;
  onGoToReschedule: () => void;
  onDismiss: () => void;
}

export const MissedPromiseScreen: React.FC<MissedPromiseScreenProps> = ({
  onCompleteLate,
  onGoToReschedule,
  onDismiss,
}) => {
  return (
    <motion.div
      key="MissedPromise"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Missed Promises Check", onBack: onDismiss }}>
        <div className="space-y-6 max-w-sm mx-auto pb-10 text-center flex flex-col items-center select-none animate-none">
          <div className="space-y-1 mt-2">
            <h1 className="text-2xl font-black text-rose-700">Messy days happen</h1>
            <p className="text-sm font-semibold text-on-surface-variant">No pressure. We avoid guilt and take tiny steps.</p>
          </div>

          <YuraMascot mood="sad" size="md" className="my-2" />

          <Card className="w-full p-5 text-left border-l-4 border-l-red-500 bg-red-50/5">
            <p className="text-xs font-bold text-rose-600 mb-1">YURA NUDGE RECOVERY</p>
            <h3 className="text-base font-extrabold text-[#7a5362]">Submit Assignment</h3>
            <p className="text-xs text-[#797582] mt-1 italic">Expected yesterday. Let's tackle it now or safely postpone.</p>
          </Card>

          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={onCompleteLate}
              variant="primary"
              className="w-full h-14 bg-gradient-to-r from-primary to-primary-container font-semibold"
            >
              I completed it late
            </Button>
            <Button
              onClick={onGoToReschedule}
              variant="outline"
              className="w-full h-14 font-semibold text-primary"
            >
              Reschedule safely
            </Button>
            <Button
              onClick={onDismiss}
              variant="ghost"
              className="w-full text-xs text-on-surface-variant font-bold"
            >
              Dismiss notification
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};
