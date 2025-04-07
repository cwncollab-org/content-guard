import { Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";

export function ExamContentHidden() {
  return (
    <Box
      sx={{
        bgcolor: grey[800],
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="body1" sx={{ color: "white", fontSize: "1.5rem" }}>
          ระบบตรวจพบว่าคุณออกจากหน้าต่างการสอบ กรุณากลับมาที่หน้าต่างการสอบทันที
          มิฉะนั้นอาจส่งผลต่อคะแนนของคุณ
        </Typography>
      </Box>
    </Box>
  );
}
