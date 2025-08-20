import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Stack,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getOrderByIdAsync, selectCurrentOrder, selectOrderStatus } from '../features/order/OrderSlice';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { useOrderStatusPolling } from '../hooks/useOrderStatusPolling';
import Lottie from 'lottie-react';
import { loadingAnimation } from '../assets';

export const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderStatus);

  // Enable live updates for order status (polls every 30 seconds)
  const { refresh } = useOrderStatusPolling(orderId, 30000, !!orderId);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderByIdAsync(orderId));
    }
  }, [dispatch, orderId]);

  if (status === 'pending') {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ width: isMobile ? 'auto' : '25rem' }}>
          <Lottie animationData={loadingAnimation} />
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Order not found
        </Typography>
        <Button onClick={() => navigate('/orders')} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/orders')}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={500}>
            Order Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order #{order._id}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Order Timeline */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Status
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={refresh}
                sx={{ ml: 'auto' }}
              >
                Refresh Status
              </Button>
            </Box>
            <OrderStatusTimeline order={order} showDetails={true} />
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Items
            </Typography>
            <Stack spacing={2}>
              {order.item.map((item, index) => (
                <Box key={index}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={item.product.thumbnail}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {item.product.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.product.brand?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="h6">
                      {formatCurrency(item.product.price)}
                    </Typography>
                  </Stack>
                  {index < order.item.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {order.paymentMode}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
                <Typography variant="body1">
                  {order.item.length}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" color="primary">
                  Total: {formatCurrency(order.total)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Shipping Address */}
          {order.address && order.address[0] && (
            <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shipping Address
              </Typography>
              <Typography variant="body2">
                {order.address[0].street}<br />
                {order.address[0].city}, {order.address[0].state}<br />
                {order.address[0].postalCode}<br />
                {order.address[0].country}<br />
                Phone: {order.address[0].phoneNumber}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
