import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/adminGuard";
import User from "@/models/User";
import AlumniProfile from "@/models/AlumniProfile";

const COLUMNS = [
  { header: "Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 28 },
  { header: "Phone", key: "phone", width: 16 },
  { header: "Role", key: "role", width: 10 },
  { header: "Verification status", key: "verificationStatus", width: 16 },
  { header: "Verified at", key: "verifiedAt", width: 20 },
  { header: "Joined at", key: "createdAt", width: 20 },
  { header: "Photo URL", key: "photoUrl", width: 36 },
  { header: "Admission year", key: "admissionYear", width: 14 },
  { header: "Passing year", key: "passingYear", width: 14 },
  { header: "Course", key: "course", width: 14 },
  { header: "Department / stream", key: "department", width: 18 },
  { header: "Hostel status", key: "hostelStatus", width: 14 },
  { header: "Home town", key: "homeTown", width: 18 },
  { header: "Home state", key: "homeState", width: 16 },
  { header: "Current city", key: "currentCity", width: 18 },
  { header: "Current state", key: "currentState", width: 16 },
  { header: "Current country", key: "currentCountry", width: 16 },
  { header: "Profession", key: "profession", width: 24 },
  { header: "Organization", key: "organization", width: 24 },
  { header: "Designation", key: "designation", width: 22 },
  { header: "Profession verified", key: "professionVerified", width: 16 },
  { header: "Bio", key: "bio", width: 40 },
  { header: "Public profile", key: "isPublic", width: 14 },
];

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16).replace("T", " ");
}

// A handful of profile photos are stored as inline base64 data URIs
// rather than a real /uploads/... link (some pre-dating the upload
// pipeline). Excel hard-caps cell text at 32,767 characters — these run
// well over that and would corrupt/truncate the cell in real Excel — so
// swap them for a short note instead of dumping raw base64 into a sheet.
function photoUrlForExport(url) {
  if (!url) return "";
  if (url.startsWith("data:")) return "(inline image — no direct link)";
  return url;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  // Never touch passwordHash / resetTokenHash — this export is a data
  // dump, not an auth artifact.
  const users = await User.find()
    .select("name email phone role verificationStatus verifiedAt createdAt photoUrl")
    .sort({ createdAt: 1 })
    .lean();

  const profiles = await AlumniProfile.find().lean();
  const profileByUser = Object.fromEntries(profiles.map((p) => [String(p.userId), p]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Maharaja Parivar";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Maharaja Fellows");
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + COLUMNS.length)}1` };

  for (const u of users) {
    const p = profileByUser[String(u._id)] || {};
    sheet.addRow({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      role: u.role,
      verificationStatus: u.verificationStatus,
      verifiedAt: fmtDate(u.verifiedAt),
      createdAt: fmtDate(u.createdAt),
      photoUrl: photoUrlForExport(u.photoUrl),
      admissionYear: p.admissionYear || "",
      passingYear: p.passingYear || "",
      course: p.course || "",
      department: p.department || "",
      hostelStatus: p.hostelStatus || "",
      homeTown: p.homeTown || "",
      homeState: p.homeState || "",
      currentCity: p.currentCity || "",
      currentState: p.currentState || "",
      currentCountry: p.currentCountry || "",
      profession: p.profession || "",
      organization: p.organization || "",
      designation: p.designation || "",
      professionVerified: p.professionVerified ? "Yes" : "No",
      bio: p.bio || "",
      isPublic: p.isPublic === false ? "No" : "Yes",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `maharaja-parivar-members-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
