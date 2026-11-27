const fs = require('fs');
const path = require('path');

const diagramsDir = path.join(__dirname, '../docs/diagrams');
if (!fs.existsSync(diagramsDir)) {
  fs.mkdirSync(diagramsDir, { recursive: true });
}

// --------------------------------------------------------------------------
// 1. USE CASE DIAGRAM (Draw.io XML)
// --------------------------------------------------------------------------
const useCaseXml = `<mxfile host="app.diagrams.net" modified="2026-11-27T15:40:00.000Z" agent="Mozilla/5.0" version="24.0.0">
  <diagram id="use_case_diagram" name="Use Case Diagram">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- System Boundary Box -->
        <mxCell id="boundary" value="Campus Events Manager System Boundary" style="shape=swimlane;startSize=30;rounded=1;arcSize=6;strokeColor=#4F46E5;fillColor=#F8FAFC;fontStyle=1;fontSize=14;fontColor=#1E1B4B;align=center;" vertex="1" parent="1">
          <mxGeometry x="240" y="40" width="680" height="740" as="geometry" />
        </mxCell>

        <!-- Use Cases inside boundary -->
        <mxCell id="uc1" value="UC-01: Register &amp; Authenticate (JWT)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="40" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc2" value="UC-02: Browse &amp; Multi-Filter Events" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="110" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc3" value="UC-03: Register for Event &amp; Auto-Waitlist" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="180" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc4" value="UC-04: Cancel Registration &amp; Promote Waitlist" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="250" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc5" value="UC-05: Propose &amp; Edit Events" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="320" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc6" value="UC-06: Manage Rosters &amp; Broadcast Reminders" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="390" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc7" value="UC-07: Review &amp; Approve/Reject Proposals" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="460" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc8" value="UC-08: View Analytics &amp; Occupancy Rates" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="530" width="280" height="50" as="geometry" />
        </mxCell>

        <mxCell id="uc9" value="UC-09: Real-Time In-App Notifications" style="ellipse;whiteSpace=wrap;html=1;fillColor=#EEF2FF;strokeColor=#6366F1;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="600" width="280" height="50" as="geometry" />
        </mxCell>

        <!-- Actors -->
        <mxCell id="actor_student" value="Student" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#E0E7FF;strokeColor=#4338CA;fontStyle=1;fontColor=#1E1B4B;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="70" y="160" width="50" height="100" as="geometry" />
        </mxCell>

        <mxCell id="actor_organizer" value="Organizer" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#DCFCE7;strokeColor=#15803D;fontStyle=1;fontColor=#1E1B4B;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="70" y="430" width="50" height="100" as="geometry" />
        </mxCell>

        <mxCell id="actor_admin" value="Administrator" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#FEF3C7;strokeColor=#B45309;fontStyle=1;fontColor=#1E1B4B;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="1030" y="320" width="50" height="100" as="geometry" />
        </mxCell>

        <!-- Associations (Student) -->
        <mxCell id="e_s_1" edge="1" parent="1" source="actor_student" target="uc1" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_s_2" edge="1" parent="1" source="actor_student" target="uc2" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_s_3" edge="1" parent="1" source="actor_student" target="uc3" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_s_4" edge="1" parent="1" source="actor_student" target="uc4" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_s_9" edge="1" parent="1" source="actor_student" target="uc9" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />

        <!-- Associations (Organizer) -->
        <mxCell id="e_o_1" edge="1" parent="1" source="actor_organizer" target="uc1" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_o_2" edge="1" parent="1" source="actor_organizer" target="uc2" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_o_5" edge="1" parent="1" source="actor_organizer" target="uc5" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_o_6" edge="1" parent="1" source="actor_organizer" target="uc6" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_o_9" edge="1" parent="1" source="actor_organizer" target="uc9" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />

        <!-- Associations (Admin) -->
        <mxCell id="e_a_1" edge="1" parent="1" source="actor_admin" target="uc1" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_a_2" edge="1" parent="1" source="actor_admin" target="uc2" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_a_7" edge="1" parent="1" source="actor_admin" target="uc7" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_a_8" edge="1" parent="1" source="actor_admin" target="uc8" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />
        <mxCell id="e_a_9" edge="1" parent="1" source="actor_admin" target="uc9" style="endArrow=none;html=1;strokeColor=#64748B;strokeWidth=1.5;" />

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// --------------------------------------------------------------------------
// 2. UML CLASS DIAGRAM (Draw.io XML)
// --------------------------------------------------------------------------
const classDiagramXml = `<mxfile host="app.diagrams.net" modified="2026-11-27T15:40:00.000Z" agent="Mozilla/5.0" version="24.0.0">
  <diagram id="uml_class_diagram" name="UML Class Diagram (Design Patterns)">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1654" pageHeight="1169" background="#ffffff">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- ================= PATTERN 1: FACTORY PATTERN ================= -->
        <mxCell id="group_factory" value="1. Creational: Factory Pattern" style="shape=swimlane;rounded=1;arcSize=6;strokeColor=#6366F1;fillColor=#F8FAFC;fontStyle=1;fontSize=14;fontColor=#3730A3;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="460" height="740" as="geometry" />
        </mxCell>

        <!-- BaseUser -->
        <mxCell id="cls_base_user" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;i&gt;&amp;lt;&amp;lt;abstract&amp;gt;&amp;gt;&lt;/i&gt;&lt;br&gt;&lt;b&gt;BaseUser&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ id: number&lt;br&gt;+ name: string&lt;br&gt;+ email: string&lt;br&gt;+ role: string&lt;br&gt;+ department: string&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ hasPermission(action): boolean&lt;br&gt;+ toJSON(): object&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#EEF2FF;strokeColor=#4F46E5;" vertex="1" parent="group_factory">
          <mxGeometry x="90" y="40" width="280" height="140" as="geometry" />
        </mxCell>

        <!-- StudentUser -->
        <mxCell id="cls_student_user" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;StudentUser&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ canRegisterForEvent: true&lt;br&gt;+ canViewMyRegistrations: true&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ hasPermission(action): boolean&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#10B981;" vertex="1" parent="group_factory">
          <mxGeometry x="100" y="240" width="260" height="90" as="geometry" />
        </mxCell>

        <!-- OrganizerUser -->
        <mxCell id="cls_org_user" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;OrganizerUser&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ canCreateEvent: true&lt;br&gt;+ canManageRoster: true&lt;br&gt;+ canBroadcastReminders: true&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ hasPermission(action): boolean&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#059669;" vertex="1" parent="group_factory">
          <mxGeometry x="100" y="370" width="260" height="100" as="geometry" />
        </mxCell>

        <!-- AdminUser -->
        <mxCell id="cls_admin_user" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;AdminUser&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ canApproveEvent: true&lt;br&gt;+ canViewReports: true&lt;br&gt;+ canManageAllEvents: true&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ hasPermission(action): boolean&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#D97706;" vertex="1" parent="group_factory">
          <mxGeometry x="100" y="510" width="260" height="100" as="geometry" />
        </mxCell>

        <!-- UserFactory -->
        <mxCell id="cls_user_factory" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;i&gt;&amp;lt;&amp;lt;creator&amp;gt;&amp;gt;&lt;/i&gt;&lt;br&gt;&lt;b&gt;UserFactory&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ {static} createUser(data): BaseUser&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#4F46E5;strokeColor=#3730A3;fontColor=#FFFFFF;" vertex="1" parent="group_factory">
          <mxGeometry x="90" y="650" width="280" height="60" as="geometry" />
        </mxCell>

        <!-- Inheritance arrows -->
        <mxCell id="inh_student" edge="1" parent="group_factory" source="cls_student_user" target="cls_base_user" style="endArrow=block;endSize=12;endFill=0;html=1;strokeColor=#4F46E5;strokeWidth=1.5;" />
        <mxCell id="inh_org" edge="1" parent="group_factory" source="cls_org_user" target="cls_base_user" style="endArrow=block;endSize=12;endFill=0;html=1;strokeColor=#4F46E5;strokeWidth=1.5;" />
        <mxCell id="inh_admin" edge="1" parent="group_factory" source="cls_admin_user" target="cls_base_user" style="endArrow=block;endSize=12;endFill=0;html=1;strokeColor=#4F46E5;strokeWidth=1.5;" />
        <mxCell id="dep_factory" edge="1" parent="group_factory" source="cls_user_factory" target="cls_student_user" style="endArrow=open;dashed=1;html=1;strokeColor=#6366F1;strokeWidth=1.5;" />

        <!-- ================= PATTERN 2: STRATEGY PATTERN ================= -->
        <mxCell id="group_strategy" value="2. Behavioral: Strategy Pattern" style="shape=swimlane;rounded=1;arcSize=6;strokeColor=#F59E0B;fillColor=#FFFDF7;fontStyle=1;fontSize=14;fontColor=#92400E;" vertex="1" parent="1">
          <mxGeometry x="540" y="40" width="460" height="740" as="geometry" />
        </mxCell>

        <mxCell id="cls_strat_interface" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;i&gt;&amp;lt;&amp;lt;interface&amp;gt;&amp;gt;&lt;/i&gt;&lt;br&gt;&lt;b&gt;EventSortStrategy&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ getOrderByClause(): string&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FEF3C7;strokeColor=#F59E0B;" vertex="1" parent="group_strategy">
          <mxGeometry x="90" y="40" width="280" height="70" as="geometry" />
        </mxCell>

        <mxCell id="cls_strat_date" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;SortByDateStrategy&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ getOrderByClause(): string&lt;br&gt;&lt;i style=&quot;color:#64748B;&quot;&gt;// return &#39;e.date ASC, e.time ASC&#39;&lt;/i&gt;&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#D97706;" vertex="1" parent="group_strategy">
          <mxGeometry x="90" y="170" width="280" height="80" as="geometry" />
        </mxCell>

        <mxCell id="cls_strat_title" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;SortByTitleStrategy&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ getOrderByClause(): string&lt;br&gt;&lt;i style=&quot;color:#64748B;&quot;&gt;// return &#39;e.title ASC&#39;&lt;/i&gt;&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#D97706;" vertex="1" parent="group_strategy">
          <mxGeometry x="90" y="280" width="280" height="80" as="geometry" />
        </mxCell>

        <mxCell id="cls_strat_cap" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;SortByCapacityStrategy&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ getOrderByClause(): string&lt;br&gt;&lt;i style=&quot;color:#64748B;&quot;&gt;// return &#39;e.capacity DESC&#39;&lt;/i&gt;&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#D97706;" vertex="1" parent="group_strategy">
          <mxGeometry x="90" y="390" width="280" height="80" as="geometry" />
        </mxCell>

        <mxCell id="cls_strat_context" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;i&gt;&amp;lt;&amp;lt;context&amp;gt;&amp;gt;&lt;/i&gt;&lt;br&gt;&lt;b&gt;EventQueryContext&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;- strategy: EventSortStrategy&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ setStrategy(strategy): void&lt;br&gt;+ resolveStrategy(sortBy): void&lt;br&gt;+ applySorting(): string&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFBEB;strokeColor=#B45309;" vertex="1" parent="group_strategy">
          <mxGeometry x="90" y="550" width="280" height="130" as="geometry" />
        </mxCell>

        <mxCell id="impl_date" edge="1" parent="group_strategy" source="cls_strat_date" target="cls_strat_interface" style="endArrow=block;endSize=12;endFill=0;dashed=1;html=1;strokeColor=#F59E0B;strokeWidth=1.5;" />
        <mxCell id="impl_title" edge="1" parent="group_strategy" source="cls_strat_title" target="cls_strat_interface" style="endArrow=block;endSize=12;endFill=0;dashed=1;html=1;strokeColor=#F59E0B;strokeWidth=1.5;" />
        <mxCell id="impl_cap" edge="1" parent="group_strategy" source="cls_strat_cap" target="cls_strat_interface" style="endArrow=block;endSize=12;endFill=0;dashed=1;html=1;strokeColor=#F59E0B;strokeWidth=1.5;" />
        <mxCell id="assoc_context" edge="1" parent="group_strategy" source="cls_strat_context" target="cls_strat_interface" style="endArrow=diamond;endFill=1;html=1;strokeColor=#B45309;strokeWidth=1.5;" />

        <!-- ================= PATTERN 3: OBSERVER PATTERN ================= -->
        <mxCell id="group_observer" value="3. Behavioral: Observer Pattern" style="shape=swimlane;rounded=1;arcSize=6;strokeColor=#A855F7;fillColor=#FAF5FF;fontStyle=1;fontSize=14;fontColor=#6B21A8;" vertex="1" parent="1">
          <mxGeometry x="1040" y="40" width="460" height="740" as="geometry" />
        </mxCell>

        <mxCell id="cls_obs_subject" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;i&gt;&amp;lt;&amp;lt;subject&amp;gt;&amp;gt;&lt;/i&gt;&lt;br&gt;&lt;b&gt;NotificationSubject&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;- observers: List&amp;lt;NotificationObserver&amp;gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ attach(observer): void&lt;br&gt;+ detach(observer): void&lt;br&gt;+ notify(eventType, data, db): Promise&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#F3E8FF;strokeColor=#9333EA;" vertex="1" parent="group_observer">
          <mxGeometry x="90" y="40" width="280" height="110" as="geometry" />
        </mxCell>

        <mxCell id="cls_obs_interface" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;i&gt;&amp;lt;&amp;lt;interface&amp;gt;&amp;gt;&lt;/i&gt;&lt;br&gt;&lt;b&gt;NotificationObserver&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ update(eventType, data, db): Promise&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#7C3AED;" vertex="1" parent="group_observer">
          <mxGeometry x="90" y="210" width="280" height="70" as="geometry" />
        </mxCell>

        <mxCell id="cls_obs_reg" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;RegistrationObserver&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ update(eventType, data, db)&lt;br&gt;&lt;i style=&quot;color:#64748B;&quot;&gt;// REGISTRATION_CONFIRMED/CANCELLED&lt;/i&gt;&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#7C3AED;" vertex="1" parent="group_observer">
          <mxGeometry x="90" y="340" width="280" height="80" as="geometry" />
        </mxCell>

        <mxCell id="cls_obs_prom" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;WaitlistPromotionObserver&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ update(eventType, data, db)&lt;br&gt;&lt;i style=&quot;color:#64748B;&quot;&gt;// WAITLIST_PROMOTED alerts&lt;/i&gt;&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#7C3AED;" vertex="1" parent="group_observer">
          <mxGeometry x="90" y="460" width="280" height="80" as="geometry" />
        </mxCell>

        <mxCell id="cls_obs_broad" value="&lt;p style=&quot;margin:0px;text-align:center;&quot;&gt;&lt;b&gt;EventBroadcastObserver&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ update(eventType, data, db)&lt;br&gt;&lt;i style=&quot;color:#64748B;&quot;&gt;// EVENT_UPDATED / EVENT_CANCELLED&lt;/i&gt;&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#7C3AED;" vertex="1" parent="group_observer">
          <mxGeometry x="90" y="580" width="280" height="80" as="geometry" />
        </mxCell>

        <mxCell id="impl_obs_reg" edge="1" parent="group_observer" source="cls_obs_reg" target="cls_obs_interface" style="endArrow=block;endSize=12;endFill=0;dashed=1;html=1;strokeColor=#7C3AED;strokeWidth=1.5;" />
        <mxCell id="impl_obs_prom" edge="1" parent="group_observer" source="cls_obs_prom" target="cls_obs_interface" style="endArrow=block;endSize=12;endFill=0;dashed=1;html=1;strokeColor=#7C3AED;strokeWidth=1.5;" />
        <mxCell id="impl_obs_broad" edge="1" parent="group_observer" source="cls_obs_broad" target="cls_obs_interface" style="endArrow=block;endSize=12;endFill=0;dashed=1;html=1;strokeColor=#7C3AED;strokeWidth=1.5;" />
        <mxCell id="assoc_obs_subj" edge="1" parent="group_observer" source="cls_obs_subject" target="cls_obs_interface" style="endArrow=diamond;endFill=1;html=1;strokeColor=#9333EA;strokeWidth=1.5;" />

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// --------------------------------------------------------------------------
// 3. SEQUENCE DIAGRAM (Draw.io XML)
// --------------------------------------------------------------------------
const sequenceXml = `<mxfile host="app.diagrams.net" modified="2026-11-27T15:40:00.000Z" agent="Mozilla/5.0" version="24.0.0">
  <diagram id="sequence_diagram" name="Sequence Diagram (Waitlist Promotion)">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Lifelines (Headers) -->
        <mxCell id="ll_actor" value="Student A (Confirmed)" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#E0E7FF;strokeColor=#4F46E5;fontStyle=1;fontSize=12;fontColor=#1E1B4B;" vertex="1" parent="1">
          <mxGeometry x="80" y="40" width="160" height="660" as="geometry" />
        </mxCell>

        <mxCell id="ll_controller" value="Registration Controller" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ECFEFF;strokeColor=#06B6D4;fontStyle=1;fontSize=12;fontColor=#0E7490;" vertex="1" parent="1">
          <mxGeometry x="300" y="40" width="160" height="660" as="geometry" />
        </mxCell>

        <mxCell id="ll_model" value="RegistrationModel" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#DCFCE7;strokeColor=#22C55E;fontStyle=1;fontSize=12;fontColor=#15803D;" vertex="1" parent="1">
          <mxGeometry x="520" y="40" width="160" height="660" as="geometry" />
        </mxCell>

        <mxCell id="ll_subject" value="NotificationSubject" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#F3E8FF;strokeColor=#A855F7;fontStyle=1;fontSize=12;fontColor=#6B21A8;" vertex="1" parent="1">
          <mxGeometry x="740" y="40" width="160" height="660" as="geometry" />
        </mxCell>

        <mxCell id="ll_db" value="SQLite Database" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#FEF3C7;strokeColor=#F59E0B;fontStyle=1;fontSize=12;fontColor=#92400E;" vertex="1" parent="1">
          <mxGeometry x="960" y="40" width="160" height="660" as="geometry" />
        </mxCell>

        <!-- Message 1: DELETE request -->
        <mxCell id="msg1" value="1: DELETE /api/events/1/register" style="html=1;verticalAlign=bottom;endArrow=block;strokeColor=#4F46E5;strokeWidth=1.5;fontColor=#1E1B4B;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="160" y="120" as="sourcePoint" />
            <mxPoint x="380" y="120" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 2: Controller to Model -->
        <mxCell id="msg2" value="2: cancelRegistration(eventId, studentId)" style="html=1;verticalAlign=bottom;endArrow=block;strokeColor=#4F46E5;strokeWidth=1.5;fontColor=#1E1B4B;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="380" y="170" as="sourcePoint" />
            <mxPoint x="600" y="170" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 3: UPDATE Cancelled -->
        <mxCell id="msg3" value="3: UPDATE registrations SET status = &#39;Cancelled&#39;" style="html=1;verticalAlign=bottom;endArrow=block;strokeColor=#4F46E5;strokeWidth=1.5;fontColor=#1E1B4B;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="600" y="220" as="sourcePoint" />
            <mxPoint x="1040" y="220" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 4: SELECT oldest waitlisted -->
        <mxCell id="msg4" value="4: SELECT * FROM registrations WHERE status = &#39;Waitlisted&#39; ORDER BY id ASC LIMIT 1" style="html=1;verticalAlign=bottom;endArrow=block;strokeColor=#4F46E5;strokeWidth=1.5;fontColor=#1E1B4B;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="600" y="280" as="sourcePoint" />
            <mxPoint x="1040" y="280" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 5: Return Student B -->
        <mxCell id="msg5" value="5: Returns Student B Record (id: 42)" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;strokeColor=#10B981;strokeWidth=1.5;fontColor=#065F46;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1040" y="340" as="sourcePoint" />
            <mxPoint x="600" y="340" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 6: UPDATE Registered -->
        <mxCell id="msg6" value="6: UPDATE registrations SET status = &#39;Registered&#39; WHERE id = 42" style="html=1;verticalAlign=bottom;endArrow=block;strokeColor=#4F46E5;strokeWidth=1.5;fontColor=#1E1B4B;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="600" y="400" as="sourcePoint" />
            <mxPoint x="1040" y="400" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 7: Notify Subject -->
        <mxCell id="msg7" value="7: notify(&#39;WAITLIST_PROMOTED&#39;, { studentId: 42, eventId: 1 })" style="html=1;verticalAlign=bottom;endArrow=block;strokeColor=#8B5CF6;strokeWidth=1.5;fontColor=#6D28D9;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="600" y="460" as="sourcePoint" />
            <mxPoint x="820" y="460" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 8: Insert notification -->
        <mxCell id="msg8" value="8: INSERT INTO notifications (user_id=42, title=&#39;Seat Confirmed!&#39;)" style="html=1;verticalAlign=bottom;endArrow=block;strokeColor=#8B5CF6;strokeWidth=1.5;fontColor=#6D28D9;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="820" y="520" as="sourcePoint" />
            <mxPoint x="1040" y="520" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Message 9: 200 OK -->
        <mxCell id="msg9" value="9: 200 OK (&quot;Registration cancelled, waitlist promoted&quot;)" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;strokeColor=#10B981;strokeWidth=1.5;fontColor=#065F46;fontSize=11;fontStyle=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="380" y="580" as="sourcePoint" />
            <mxPoint x="160" y="580" as="targetPoint" />
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// --------------------------------------------------------------------------
// 4. ARCHITECTURE DIAGRAM (Draw.io XML)
// --------------------------------------------------------------------------
const architectureXml = `<mxfile host="app.diagrams.net" modified="2026-11-27T15:40:00.000Z" agent="Mozilla/5.0" version="24.0.0">
  <diagram id="architecture_diagram" name="System Architecture Diagram">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Tier 1: Client Presentation -->
        <mxCell id="tier1" value="Tier 1: Presentation Layer (Client Browser - SPA/MPA)" style="shape=swimlane;rounded=1;arcSize=6;strokeColor=#6366F1;fillColor=#EEF2FF;fontStyle=1;fontSize=14;fontColor=#3730A3;" vertex="1" parent="1">
          <mxGeometry x="80" y="40" width="1000" height="140" as="geometry" />
        </mxCell>
        <mxCell id="t1_c1" value="HTML5 &amp; Custom CSS&#xa;Responsive Glassmorphic UI" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#818CF8;fontStyle=1;fontSize=12;" vertex="1" parent="tier1">
          <mxGeometry x="40" y="50" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t1_c2" value="Bootstrap 5.3 &amp; Icons&#xa;Modern Components" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#818CF8;fontStyle=1;fontSize=12;" vertex="1" parent="tier1">
          <mxGeometry x="280" y="50" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t1_c3" value="Fetch API &amp; Route Guards&#xa;Token Storage &amp; Toasts" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#818CF8;fontStyle=1;fontSize=12;" vertex="1" parent="tier1">
          <mxGeometry x="520" y="50" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t1_c4" value="Chart.js Analytics&#xa;Interactive Doughnut Chart" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#818CF8;fontStyle=1;fontSize=12;" vertex="1" parent="tier1">
          <mxGeometry x="760" y="50" width="200" height="60" as="geometry" />
        </mxCell>

        <!-- Tier 2: Application Layer -->
        <mxCell id="tier2" value="Tier 2: Application &amp; Middleware Layer (Node.js &amp; Express)" style="shape=swimlane;rounded=1;arcSize=6;strokeColor=#10B981;fillColor=#F0FDF4;fontStyle=1;fontSize=14;fontColor=#065F46;" vertex="1" parent="1">
          <mxGeometry x="80" y="240" width="1000" height="140" as="geometry" />
        </mxCell>
        <mxCell id="t2_c1" value="Express Router&#xa;/api/auth, /api/events" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#34D399;fontStyle=1;fontSize=12;" vertex="1" parent="tier2">
          <mxGeometry x="40" y="50" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t2_c2" value="JWT &amp; RBAC Middleware&#xa;authenticateToken, authorizeRoles" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#34D399;fontStyle=1;fontSize=12;" vertex="1" parent="tier2">
          <mxGeometry x="280" y="50" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t2_c3" value="Registration Engine&#xa;Capacity Check &amp; Auto-Waitlist" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#34D399;fontStyle=1;fontSize=12;" vertex="1" parent="tier2">
          <mxGeometry x="520" y="50" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t2_c4" value="Reports Pipeline&#xa;Occupancy &amp; Popularity Metrics" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#34D399;fontStyle=1;fontSize=12;" vertex="1" parent="tier2">
          <mxGeometry x="760" y="50" width="200" height="60" as="geometry" />
        </mxCell>

        <!-- Tier 3: Design Patterns -->
        <mxCell id="tier3" value="Tier 3: Software Engineering Design Patterns Layer" style="shape=swimlane;rounded=1;arcSize=6;strokeColor=#8B5CF6;fillColor=#FAF5FF;fontStyle=1;fontSize=14;fontColor=#6B21A8;" vertex="1" parent="1">
          <mxGeometry x="80" y="440" width="1000" height="130" as="geometry" />
        </mxCell>
        <mxCell id="t3_c1" value="Factory Pattern&#xa;UserFactory (Role Instantiation)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#A78BFA;fontStyle=1;fontSize=12;" vertex="1" parent="tier3">
          <mxGeometry x="60" y="45" width="260" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t3_c2" value="Strategy Pattern&#xa;EventQueryContext (Sorting Strategies)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#A78BFA;fontStyle=1;fontSize=12;" vertex="1" parent="tier3">
          <mxGeometry x="370" y="45" width="260" height="60" as="geometry" />
        </mxCell>
        <mxCell id="t3_c3" value="Observer Pattern&#xa;NotificationSubject &amp; Observers" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#A78BFA;fontStyle=1;fontSize=12;" vertex="1" parent="tier3">
          <mxGeometry x="680" y="45" width="260" height="60" as="geometry" />
        </mxCell>

        <!-- Tier 4: Data Layer -->
        <mxCell id="tier4" value="Tier 4: Data Persistence Layer (SQLite Database)" style="shape=swimlane;rounded=1;arcSize=6;strokeColor=#F59E0B;fillColor=#FFFBEB;fontStyle=1;fontSize=14;fontColor=#92400E;" vertex="1" parent="1">
          <mxGeometry x="80" y="630" width="1000" height="130" as="geometry" />
        </mxCell>
        <mxCell id="t4_c1" value="users Table&#xa;id, email, password_hash, role" style="shape=cylinder;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FBBF24;fontStyle=1;fontSize=11;" vertex="1" parent="tier4">
          <mxGeometry x="60" y="40" width="190" height="70" as="geometry" />
        </mxCell>
        <mxCell id="t4_c2" value="events Table&#xa;id, title, date, venue, capacity" style="shape=cylinder;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FBBF24;fontStyle=1;fontSize=11;" vertex="1" parent="tier4">
          <mxGeometry x="290" y="40" width="190" height="70" as="geometry" />
        </mxCell>
        <mxCell id="t4_c3" value="registrations Table&#xa;id, event_id, student_id, status" style="shape=cylinder;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FBBF24;fontStyle=1;fontSize=11;" vertex="1" parent="tier4">
          <mxGeometry x="520" y="40" width="190" height="70" as="geometry" />
        </mxCell>
        <mxCell id="t4_c4" value="notifications Table&#xa;id, user_id, title, message, is_read" style="shape=cylinder;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#FBBF24;fontStyle=1;fontSize=11;" vertex="1" parent="tier4">
          <mxGeometry x="750" y="40" width="190" height="70" as="geometry" />
        </mxCell>

        <!-- Connectors between tiers -->
        <mxCell id="conn_1_2" value="HTTP/HTTPS JSON REST API (JWT Bearer Auth)" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#4F46E5;strokeWidth=2;fontColor=#1E1B4B;fontSize=11;fontStyle=1;" edge="1" parent="1" source="tier1" target="tier2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="conn_2_3" value="Decoupled Object Creation &amp; Event Notification Delegation" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=2;fontColor=#065F46;fontSize=11;fontStyle=1;" edge="1" parent="1" source="tier2" target="tier3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="conn_3_4" value="Data Access Objects (DAO) &amp; Relational SQLite Queries" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#8B5CF6;strokeWidth=2;fontColor=#6B21A8;fontSize=11;fontStyle=1;" edge="1" parent="1" source="tier3" target="tier4">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// Write all draw.io XML files
fs.writeFileSync(path.join(diagramsDir, '01_architecture_diagram.drawio'), architectureXml);
fs.writeFileSync(path.join(diagramsDir, '02_uml_class_diagram.drawio'), classDiagramXml);
fs.writeFileSync(path.join(diagramsDir, '03_sequence_diagram.drawio'), sequenceXml);
fs.writeFileSync(path.join(diagramsDir, '04_use_case_diagram.drawio'), useCaseXml);

console.log("All Draw.io XML files successfully created in docs/diagrams/!");
