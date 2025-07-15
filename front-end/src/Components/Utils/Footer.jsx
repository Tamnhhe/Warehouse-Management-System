import React from 'react';
import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

// Bảng màu để đảm bảo nhất quán
const palette = {
  dark: '#155E64',
  medium: '#75B39C',
  light: '#A0E4D0',
  white: '#FFFFFF',
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: palette.dark, // Nền màu tối nhất
        color: palette.white,         // Chữ màu trắng
        py: 3, // Padding top và bottom
        mt: 'auto', // Đẩy footer xuống cuối trang nếu nội dung ngắn
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Xếp chồng trên mobile, ngang trên desktop
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2, // Khoảng cách giữa các item
        }}>
          {/* Copyright Section */}
          <Typography variant="body2" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' '}
            <Link color="inherit" href="https://your-company-website.com/">
              Movico Group
            </Link>
            . All Rights Reserved.
          </Typography>

          {/* Social Media Section */}
          <Box>
            <IconButton
              component="a"
              href="https://facebook.com"
              target="_blank"
              sx={{ 
                color: 'inherit',
                '&:hover': { 
                  color: palette.light // Nhấn màu sáng khi hover
                } 
              }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://twitter.com"
              target="_blank"
              sx={{ 
                color: 'inherit',
                '&:hover': { 
                  color: palette.light 
                } 
              }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://instagram.com"
              target="_blank"
              sx={{ 
                color: 'inherit',
                '&:hover': { 
                  color: palette.light 
                } 
              }}
            >
              <InstagramIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;