import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Security,
  LocalShipping,
  Stars
} from '@mui/icons-material';

export const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <ShoppingBag sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Wide Product Range',
      description: 'Discover thousands of products across various categories'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Secure Shopping',
      description: 'Your data and payments are protected with advanced security'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: <Stars sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Customer Reviews',
      description: 'Read authentic reviews from verified buyers'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ py: 2, mb: 4 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight="bold" color="primary">
              MERN Ecommerce
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button component={Link} to="/login" variant="outlined">
                Login
              </Button>
              <Button component={Link} to="/signup" variant="contained">
                Sign Up
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                fontWeight="bold"
                color="text.primary"
              >
                Your Ultimate Shopping Destination
              </Typography>
              <Typography variant="h6" color="text.secondary" lineHeight={1.6}>
                Discover amazing products, enjoy secure shopping, and experience 
                fast delivery - all in one seamless platform.
              </Typography>
              <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mt: 4 }}>
                <Button 
                  component={Link} 
                  to="/signup" 
                  variant="contained" 
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                >
                  Get Started
                </Button>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="outlined" 
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                >
                  Login to Shop
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: 400,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" color="white" fontWeight="bold">
                🛍️
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" sx={{ mb: 4 }}>
          Why Choose Us?
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Stack spacing={3} textAlign="center">
            <Typography variant="h4" fontWeight="bold">
              Ready to Start Shopping?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Join thousands of happy customers today!
            </Typography>
            <Stack direction={isMobile ? "column" : "row"} spacing={2} justifyContent="center">
              <Button 
                component={Link} 
                to="/signup" 
                variant="contained" 
                color="secondary"
                size="large"
                sx={{ py: 1.5, px: 4 }}
              >
                Create Account
              </Button>
              <Button 
                component={Link} 
                to="/login" 
                variant="outlined" 
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Login Now
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.100', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center" color="text.secondary">
            © 2025 MERN Ecommerce. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
