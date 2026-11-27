import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('docs/diagrams', exist_ok=True)

# Helper for loading a standard font
def get_fonts():
    try:
        # Try macOS system fonts
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
        head_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 17)
        body_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 13)
        code_font = ImageFont.truetype("/System/Library/Fonts/Courier.dfont", 12)
    except:
        title_font = ImageFont.load_default()
        head_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        code_font = ImageFont.load_default()
    return title_font, head_font, body_font, code_font

title_font, head_font, body_font, code_font = get_fonts()

# -------------------------------------------------------------
# Diagram 1: Architecture Diagram
# -------------------------------------------------------------
def create_architecture_diagram():
    w, h = 1200, 750
    img = Image.new('RGB', (w, h), color='#F8FAFC')
    draw = ImageDraw.Draw(img)

    # Title Banner
    draw.rectangle([(0, 0), (w, 65)], fill='#0F172A')
    draw.text((w//2, 32), "Campus Events Manager - 3-Tier Layered Architecture", fill='#FFFFFF', font=title_font, anchor='mm')

    layers = [
        ("Presentation Layer (Client Browser)", "#EEF2FF", "#4F46E5", 100, 140, [
            "Responsive Web Pages (HTML5 / Bootstrap 5 / Custom CSS)",
            "Asynchronous HTTP Fetch Client (API Wrapper & Route Guards)",
            "Dynamic Canvas Visualizations (Chart.js Analytics Dashboard)",
            "Client-Side Role Authorization & Toast Notification Hub"
        ]),
        ("Application & Middleware Layer (Node.js & Express)", "#F0FDF4", "#10B981", 270, 200, [
            "Express REST Routing & Error Handling Middleware (/api/*)",
            "JWT Authentication & Role-Based Access Control (RBAC Middleware)",
            "Design Patterns Layer:",
            "  • UserFactory (Role instantiation & permissions)",
            "  • EventQueryContext & Strategy Pattern (Dynamic sorting)",
            "  • NotificationSubject & Observers (Decoupled alerts & promotions)"
        ]),
        ("Data Persistence Layer (SQLite Database)", "#FFFBEB", "#F59E0B", 500, 180, [
            "Data Access Models (UserModel, EventModel, RegistrationModel, etc.)",
            "Relational Schema with Strict Foreign Keys & Cascading Rules",
            "File-based SQLite3 Persistence (data/campus_events.sqlite)",
            "Dual-mode In-Memory Database (:memory:) for Fast Test Isolation"
        ])
    ]

    for title, bg, border, y, ht, items in layers:
        draw.rounded_rectangle([(80, y), (w-80, y+ht)], radius=12, fill=bg, outline=border, width=2)
        draw.text((110, y + 25), title, fill='#0F172A', font=head_font)
        for i, item in enumerate(items):
            draw.text((120, y + 55 + i * 22), "• " + item, fill='#334155', font=body_font)

    # Connecting arrows
    for arrow_y in [245, 475]:
        draw.line([(w//2, arrow_y), (w//2, arrow_y+20)], fill='#4F46E5', width=3)
        draw.polygon([(w//2-6, arrow_y+20), (w//2+6, arrow_y+20), (w//2, arrow_y+26)], fill='#4F46E5')

    img.save('docs/diagrams/01_architecture_diagram.png')
    print("Saved 01_architecture_diagram.png")

# -------------------------------------------------------------
# Diagram 2: UML Class Diagram (Design Patterns)
# -------------------------------------------------------------
def create_class_diagram():
    w, h = 1300, 850
    img = Image.new('RGB', (w, h), color='#FFFFFF')
    draw = ImageDraw.Draw(img)

    # Title Banner
    draw.rectangle([(0, 0), (w, 65)], fill='#0F172A')
    draw.text((w//2, 32), "UML Class Diagram - Software Design Patterns Implementation", fill='#FFFFFF', font=title_font, anchor='mm')

    # Pattern 1: Factory Pattern Box (Left)
    draw.rounded_rectangle([(50, 90), (430, 800)], radius=12, fill='#F8FAFC', outline='#CBD5E1', width=2)
    draw.text((240, 115), "1. Creational: Factory Pattern", fill='#4F46E5', font=head_font, anchor='mm')
    
    # BaseUser box
    draw.rectangle([(70, 140), (410, 270)], fill='#FFFFFF', outline='#4F46E5', width=2)
    draw.text((240, 160), "<<abstract>> BaseUser", fill='#0F172A', font=head_font, anchor='mm')
    draw.line([(70, 180), (410, 180)], fill='#4F46E5', width=1)
    draw.text((80, 190), "+id: int\n+name: string\n+email: string\n+role: string", fill='#334155', font=code_font)
    draw.line([(70, 240), (410, 240)], fill='#4F46E5', width=1)
    draw.text((80, 248), "+hasPermission(action): bool", fill='#334155', font=code_font)

    # Subclasses
    subs = [
        ("StudentUser", "canRegisterForEvent: true", 300),
        ("OrganizerUser", "canCreateEvent: true", 420),
        ("AdminUser", "canApproveEvent: true\ncanViewReports: true", 540)
    ]
    for s_title, perm, s_y in subs:
        draw.rectangle([(100, s_y), (380, s_y+85)], fill='#FFFFFF', outline='#10B981', width=1)
        draw.text((240, s_y+15), s_title, fill='#0F172A', font=body_font, anchor='mm')
        draw.line([(100, s_y+30), (380, s_y+30)], fill='#CBD5E1', width=1)
        draw.text((110, s_y+38), perm, fill='#475569', font=code_font)

    # UserFactory box
    draw.rectangle([(70, 680), (410, 760)], fill='#EEF2FF', outline='#4F46E5', width=2)
    draw.text((240, 700), "UserFactory", fill='#4F46E5', font=head_font, anchor='mm')
    draw.line([(70, 715), (410, 715)], fill='#4F46E5', width=1)
    draw.text((80, 725), "+createUser(data: object): BaseUser", fill='#0F172A', font=code_font)

    # Pattern 2: Strategy Pattern Box (Middle)
    draw.rounded_rectangle([(460, 90), (860, 800)], radius=12, fill='#F8FAFC', outline='#CBD5E1', width=2)
    draw.text((660, 115), "2. Behavioral: Strategy Pattern", fill='#4F46E5', font=head_font, anchor='mm')

    # EventSortStrategy interface
    draw.rectangle([(480, 140), (840, 240)], fill='#FFFFFF', outline='#F59E0B', width=2)
    draw.text((660, 160), "<<interface>> EventSortStrategy", fill='#0F172A', font=head_font, anchor='mm')
    draw.line([(480, 180), (840, 180)], fill='#F59E0B', width=1)
    draw.text((490, 200), "+getOrderByClause(): string", fill='#334155', font=code_font)

    # Strategies
    strats = [
        ("SortByDateStrategy", "date ASC, time ASC", 270),
        ("SortByTitleStrategy", "title ASC", 370),
        ("SortByCapacityStrategy", "capacity DESC", 470)
    ]
    for st_title, clause, st_y in strats:
        draw.rectangle([(500, st_y), (820, st_y+75)], fill='#FFFFFF', outline='#F59E0B', width=1)
        draw.text((660, st_y+15), st_title, fill='#0F172A', font=body_font, anchor='mm')
        draw.line([(500, st_y+30), (820, st_y+30)], fill='#CBD5E1', width=1)
        draw.text((510, st_y+40), f"return '{clause}'", fill='#475569', font=code_font)

    # Context box
    draw.rectangle([(480, 600), (840, 740)], fill='#FFFBEB', outline='#F59E0B', width=2)
    draw.text((660, 620), "EventQueryContext", fill='#D97706', font=head_font, anchor='mm')
    draw.line([(480, 640), (840, 640)], fill='#F59E0B', width=1)
    draw.text((490, 650), "-strategy: EventSortStrategy", fill='#0F172A', font=code_font)
    draw.line([(480, 675), (840, 675)], fill='#F59E0B', width=1)
    draw.text((490, 685), "+setStrategy(strategy)\n+resolveStrategy(sortByParam)\n+applySorting(): string", fill='#0F172A', font=code_font)

    # Pattern 3: Observer Pattern Box (Right)
    draw.rounded_rectangle([(890, 90), (1260, 800)], radius=12, fill='#F8FAFC', outline='#CBD5E1', width=2)
    draw.text((1075, 115), "3. Behavioral: Observer Pattern", fill='#4F46E5', font=head_font, anchor='mm')

    # NotificationSubject box
    draw.rectangle([(910, 140), (1240, 270)], fill='#EEF2FF', outline='#6366F1', width=2)
    draw.text((1075, 160), "NotificationSubject", fill='#4338CA', font=head_font, anchor='mm')
    draw.line([(910, 180), (1240, 180)], fill='#6366F1', width=1)
    draw.text((920, 190), "-observers: List<Observer>", fill='#334155', font=code_font)
    draw.line([(910, 210), (1240, 210)], fill='#6366F1', width=1)
    draw.text((920, 220), "+attach(observer)\n+detach(observer)\n+notify(eventType, data, db)", fill='#334155', font=code_font)

    # NotificationObserver interface
    draw.rectangle([(910, 310), (1240, 390)], fill='#FFFFFF', outline='#8B5CF6', width=2)
    draw.text((1075, 330), "<<interface>> NotificationObserver", fill='#0F172A', font=head_font, anchor='mm')
    draw.line([(910, 345), (1240, 345)], fill='#8B5CF6', width=1)
    draw.text((920, 355), "+update(eventType, data, db)", fill='#334155', font=code_font)

    # Observers
    obs = [
        ("RegistrationObserver", "CONFIRMED, WAITLISTED, CANCELLED", 430),
        ("WaitlistPromotionObserver", "WAITLIST_PROMOTED", 540),
        ("EventBroadcastObserver", "EVENT_UPDATED, EVENT_CANCELLED", 650)
    ]
    for o_title, evts, o_y in obs:
        draw.rectangle([(920, o_y), (1230, o_y+80)], fill='#FFFFFF', outline='#8B5CF6', width=1)
        draw.text((1075, o_y+15), o_title, fill='#0F172A', font=body_font, anchor='mm')
        draw.line([(920, o_y+30), (1230, o_y+30)], fill='#CBD5E1', width=1)
        draw.text((930, o_y+40), f"Handles:\n{evts}", fill='#6B21A8', font=code_font)

    img.save('docs/diagrams/02_uml_class_diagram.png')
    print("Saved 02_uml_class_diagram.png")

# -------------------------------------------------------------
# Diagram 3: Sequence Diagram
# -------------------------------------------------------------
def create_sequence_diagram():
    w, h = 1100, 750
    img = Image.new('RGB', (w, h), color='#FFFFFF')
    draw = ImageDraw.Draw(img)

    # Title Banner
    draw.rectangle([(0, 0), (w, 65)], fill='#0F172A')
    draw.text((w//2, 32), "Sequence Diagram: Cancellation & Automated Waitlist Promotion", fill='#FFFFFF', font=title_font, anchor='mm')

    cols = [
        ("Student A", 120),
        ("API Router", 320),
        ("RegistrationModel", 540),
        ("NotificationSubject", 760),
        ("SQLite Database", 960)
    ]

    for label, x in cols:
        draw.rectangle([(x-75, 90), (x+75, 130)], fill='#EEF2FF', outline='#4F46E5', width=2)
        draw.text((x, 110), label, fill='#0F172A', font=head_font, anchor='mm')
        draw.line([(x, 130), (x, 700)], fill='#CBD5E1', width=2, joint='curve')

    events = [
        (160, 120, 320, "1. DELETE /api/events/:id/register", True),
        (220, 320, 540, "2. cancelRegistration(studentA, eventId)", True),
        (280, 540, 960, "3. UPDATE registrations status = 'Cancelled'", True),
        (340, 540, 960, "4. SELECT oldest waitlisted student (Student B)", True),
        (400, 960, 540, "5. Returns Student B record", False),
        (460, 540, 960, "6. UPDATE Student B status = 'Registered'", True),
        (520, 540, 760, "7. notify('WAITLIST_PROMOTED', {studentB, eventId})", True),
        (580, 760, 960, "8. INSERT INTO notifications (Student B alert)", True),
        (640, 320, 120, "9. 200 OK ('Cancelled & Waitlist Promoted')", False)
    ]

    for y, x1, x2, msg, is_call in events:
        color = '#4F46E5' if is_call else '#10B981'
        draw.line([(x1, y), (x2, y)], fill=color, width=2)
        # Arrowhead
        direction = 1 if x2 > x1 else -1
        draw.polygon([(x2, y), (x2 - direction*8, y-5), (x2 - direction*8, y+5)], fill=color)
        draw.text(((x1+x2)//2, y-12), msg, fill='#0F172A', font=body_font, anchor='mm')

    img.save('docs/diagrams/03_sequence_diagram.png')
    print("Saved 03_sequence_diagram.png")

# -------------------------------------------------------------
# Diagram 4: Use Case Diagram
# -------------------------------------------------------------
def create_use_case_diagram():
    w, h = 1100, 700
    img = Image.new('RGB', (w, h), color='#FFFFFF')
    draw = ImageDraw.Draw(img)

    # Title Banner
    draw.rectangle([(0, 0), (w, 65)], fill='#0F172A')
    draw.text((w//2, 32), "System Use Case Diagram - Campus Events Manager", fill='#FFFFFF', font=title_font, anchor='mm')

    # System boundary
    draw.rectangle([(250, 90), (850, 660)], fill='#F8FAFC', outline='#64748B', width=2)
    draw.text((550, 115), "Campus Events Manager Boundary", fill='#0F172A', font=head_font, anchor='mm')

    # Actors
    actors = [
        ("Student", 100, 250, "#4F46E5"),
        ("Organizer", 100, 480, "#059669"),
        ("Admin", 980, 360, "#D97706")
    ]
    for role, ax, ay, col in actors:
        # Simple stick figure / avatar circle
        draw.ellipse([(ax-25, ay-45), (ax+25, ay+5)], fill=col)
        draw.text((ax, ay-20), role[0], fill='#FFFFFF', font=head_font, anchor='mm')
        draw.text((ax, ay+25), role, fill='#0F172A', font=head_font, anchor='mm')

    # Use Cases
    use_cases = [
        ("UC1: Register & Authenticate", 550, 160, ["Student", "Organizer", "Admin"]),
        ("UC2: Browse & Filter Events", 550, 220, ["Student", "Organizer", "Admin"]),
        ("UC3: Register for Event / Join Waitlist", 550, 280, ["Student"]),
        ("UC4: Cancel Registration (Promote Waitlist)", 550, 340, ["Student"]),
        ("UC5: Create & Edit Event Proposals", 550, 400, ["Organizer"]),
        ("UC6: Manage Attendees & Send Reminders", 550, 460, ["Organizer"]),
        ("UC7: Review & Approve/Reject Events", 550, 520, ["Admin"]),
        ("UC8: View System Analytics & Reports", 550, 580, ["Admin"]),
        ("UC9: Receive In-App Notifications", 550, 630, ["Student", "Organizer", "Admin"])
    ]

    for uc_title, ux, uy, authorized in use_cases:
        draw.rounded_rectangle([(ux-180, uy-18), (ux+180, uy+18)], radius=18, fill='#FFFFFF', outline='#4F46E5', width=1)
        draw.text((ux, uy), uc_title, fill='#1E293B', font=body_font, anchor='mm')

        # Connect lines
        if "Student" in authorized:
            draw.line([(125, 250), (ux-180, uy)], fill='#94A3B8', width=1)
        if "Organizer" in authorized:
            draw.line([(125, 480), (ux-180, uy)], fill='#94A3B8', width=1)
        if "Admin" in authorized:
            draw.line([(955, 360), (ux+180, uy)], fill='#94A3B8', width=1)

    img.save('docs/diagrams/04_use_case_diagram.png')
    print("Saved 04_use_case_diagram.png")

if __name__ == '__main__':
    create_architecture_diagram()
    create_class_diagram()
    create_sequence_diagram()
    create_use_case_diagram()
    print("ALL 4 UML & ARCHITECTURE DIAGRAMS CREATED!")
