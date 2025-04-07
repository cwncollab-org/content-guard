import "./App.css";
import { ContentGuard, ContentGuardProvider, useContentGuard } from "./lib";

import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { ExamineeInfo } from "./ExamineeInfo";
import { ExamContent } from "./ExamContent";
import { grey } from "@mui/material/colors";
import { ExamContentHidden } from "./ExamContentHidden";

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "Prompt",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContentGuardProvider>
        <AppContent />
      </ContentGuardProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { requestFullscreen, isFullscreen } = useContentGuard();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100dvw",
        height: "100dvh",
        backgroundColor: "white",
      }}
    >
      {/* {JSON.stringify(state)} */}
      <ExamineeInfo />
      <Box
        sx={{
          flexGrow: 1,
          widtH: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: grey[200],
        }}
      >
        <ContentGuard
          replacement={<ExamContentHidden />}
          style={{ width: "100%", height: "100%" }}
        >
          <ExamContent />
        </ContentGuard>
        {!isFullscreen && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box sx={{}}>
              <Container
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">การสอบออนไลน์</Typography>
                <Typography variant="body1">
                  การสอบนี้ดำเนินการผ่านระบบออนไลน์บนเว็บเบราว์เซอร์
                  โดยผู้เข้าสอบจะต้องเข้าสู่โหมดเต็มหน้าจอ (Fullscreen)
                  และคงสถานะดังกล่าวตลอดระยะเวลาการสอบ
                </Typography>
                <Typography variant="body1">
                  เมื่อพร้อมแล้ว กดปุ่มด้านล่างเพื่อเข้าสู่การสอบ
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 3, mb: 6 }}
                  onClick={requestFullscreen}
                >
                  เข้าสู่การสอบ
                </Button>
              </Container>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
