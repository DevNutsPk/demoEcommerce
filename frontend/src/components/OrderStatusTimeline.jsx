import React from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Chip,
  Stack
} from '@mui/material';
import { 
  PendingActions as PendingIcon,
  LocalShipping as ShippedIcon, 
  DeliveryDining as OutForDeliveryIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';

export const OrderStatusTimeline = ({ order, showDetails = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Define the status steps
  const statusSteps = [
    {
      label: 'Order Placed',
      status: 'Pending',
      icon: <PendingIcon />,
      description: 'Your order has been received and is being processed'
    },
    {
      label: 'Dispatched',
      status: 'Dispatched', 
      icon: <ShippedIcon />,
      description: 'Your order has been shipped and is on its way'
    },
    {
      label: 'Out for Delivery',
      status: 'Out for delivery',
      icon: <OutForDeliveryIcon />,
      description: 'Your order is out for delivery'
    },
    {
      label: 'Delivered',
      status: 'Delivered',
      icon: <DeliveredIcon />,
      description: 'Your order has been delivered successfully'
    }
  ];

  // Handle cancelled orders
  const isCancelled = order.status === 'Cancelled';
  
  // Get current step index
  const getCurrentStep = () => {
    if (isCancelled) return -1;
    return statusSteps.findIndex(step => step.status === order.status);
  };

  const currentStep = getCurrentStep();

  // Get step color based on status
  const getStepColor = (stepIndex) => {
    if (isCancelled) return 'error';
    if (stepIndex <= currentStep) return 'success';
    return 'disabled';
  };

  // Get timestamp for a status from history
  const getStatusTimestamp = (status) => {
    if (!order.statusHistory || order.statusHistory.length === 0) {
      return order.createdAt; // Fallback to order creation date
    }
    
    const statusEntry = order.statusHistory.find(entry => entry.status === status);
    return statusEntry ? statusEntry.changedAt : null;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isCancelled) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <CancelledIcon color="error" />
          <Typography variant="h6" color="error">
            Order Cancelled
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          This order was cancelled on {formatDate(getStatusTimestamp('Cancelled'))}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* Current Status Chip */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6">Order Status:</Typography>
        <Chip 
          label={order.status} 
          color={currentStep >= 0 ? 'primary' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      </Stack>

      {/* Timeline Stepper */}
      <Stepper 
        activeStep={currentStep} 
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{
          '& .MuiStepLabel-root .Mui-completed': {
            color: theme.palette.success.main,
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: theme.palette.primary.main,
          }
        }}
      >
        {statusSteps.map((step, index) => (
          <Step key={step.status} completed={index < currentStep}>
            <StepLabel 
              StepIconComponent={() => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 
                      index <= currentStep ? theme.palette.success.main :
                      index === currentStep + 1 ? theme.palette.primary.main :
                      theme.palette.grey[300],
                    color: 'white',
                    fontSize: '1.2rem'
                  }}
                >
                  {React.cloneElement(step.icon, { 
                    sx: { color: 'white', fontSize: '1.2rem' } 
                  })}
                </Box>
              )}
            >
              <Typography variant="subtitle2" fontWeight={index <= currentStep ? 'bold' : 'normal'}>
                {step.label}
              </Typography>
              {showDetails && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {index <= currentStep && formatDate(getStatusTimestamp(step.status))}
                </Typography>
              )}
            </StepLabel>
            
            {/* Step Content for mobile vertical layout */}
            {isMobile && showDetails && (
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
                {index <= currentStep && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(getStatusTimestamp(step.status))}
                  </Typography>
                )}
              </StepContent>
            )}
          </Step>
        ))}
      </Stepper>

      {/* Desktop description */}
      {!isMobile && showDetails && currentStep >= 0 && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {statusSteps[Math.max(0, currentStep)].description}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
