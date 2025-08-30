import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Autocomplete,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectUserInfo } from "../../user/UserSlice";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { selectCartItems } from "../../cart/CartSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { selectWishlistItems } from "../../wishlist/WishlistSlice";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TuneIcon from "@mui/icons-material/Tune";
import {
  selectProductIsFilterOpen,
  toggleFilters,
} from "../../products/ProductSlice";
import SearchIcon from "@mui/icons-material/Search";
import { selectBrands } from "../../brands/BrandSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { selectProducts } from "../../products/ProductSlice";

export const Navbar = ({ isProductList = false }) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userInfo = useSelector(selectUserInfo);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const is700 = useMediaQuery(theme.breakpoints.down(700));

  const wishlistItems = useSelector(selectWishlistItems);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);

  const [search, setSearch] = React.useState("");
  const [searchSuggestions, setSearchSuggestions] = React.useState([]);
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const products = useSelector(selectProducts);

  // Generate search suggestions from database
  React.useEffect(() => {
    const suggestions = [];

    // Add product titles
    products?.forEach((product) => {
      if (product.title && !suggestions.includes(product.title)) {
        suggestions.push(product.title);
      }
    });

    // Add brand names
    brands?.forEach((brand) => {
      if (brand.name && !suggestions.includes(brand.name)) {
        suggestions.push(brand.name);
      }
    });

    // Add category names
    categories?.forEach((category) => {
      if (category.name && !suggestions.includes(category.name)) {
        suggestions.push(category.name);
      }
    });

    setSearchSuggestions(suggestions);
  }, [products, brands, categories]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters());
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const query = search?.trim();
      if (loggedInUser && loggedInUser?.isAdmin) {
        navigate(
          query
            ? `/admin/dashboard?keyword=${encodeURIComponent(query)}`
            : "/admin/dashboard"
        );
      }
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleSearchSelect = (value) => {
    if (value && loggedInUser && loggedInUser?.isAdmin) {
      navigate(`/admin/dashboard?keyword=${encodeURIComponent(value)}`);
    }
  };

  const settings = [
    { name: "Home", to: "/" },
    {
      name: "Profile",
      to: loggedInUser && loggedInUser?.isAdmin ? "/admin/profile" : "/profile",
    },
    {
      name: loggedInUser && loggedInUser?.isAdmin ? "Orders" : "My orders",
      to: loggedInUser && loggedInUser?.isAdmin ? "/admin/orders" : "/orders",
    },
    { name: "Logout", to: "/logout" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "white",
        boxShadow: "none",
        color: "text.primary",
      }}
    >
      <Toolbar
        sx={{
          p: 1,
          height: "4rem",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          MERN SHOP
        </Typography>

        {loggedInUser && loggedInUser?.isAdmin && (
          <Stack
            flex={1}
            alignItems={"center"}
            justifyContent={"center"}
            px={is700 ? 1 : 3}
          >
            <Autocomplete
              size="small"
              freeSolo
              options={searchSuggestions}
              value={search}
              onChange={(event, newValue) => handleSearchSelect(newValue)}
              onInputChange={(event, newInputValue) =>
                handleSearchChange(newInputValue)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products..."
              sx={{
                width: "100%",
                maxWidth: 600,
                display: { xs: "none", sm: "flex" },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search products, brands, categories..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Stack>
        )}

        <Stack
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          columnGap={2}
        >
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={userInfo?.name} src="null" />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {loggedInUser && loggedInUser?.isAdmin && (
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography
                  component={Link}
                  color={"text.primary"}
                  sx={{ textDecoration: "none" }}
                  to="/admin/add-product"
                  textAlign="center"
                >
                  Add new Product
                </Typography>
              </MenuItem>
            )}
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={handleCloseUserMenu}>
                <Typography
                  component={Link}
                  color={"text.primary"}
                  sx={{ textDecoration: "none" }}
                  to={setting.to}
                  textAlign="center"
                >
                  {setting.name}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
          <Typography variant="h6" fontWeight={300}>
            {!is480 && userInfo && `Hey👋, ${userInfo?.name}`}
          </Typography>
          {loggedInUser && loggedInUser.isAdmin && (
            <Button variant="contained">Admin</Button>
          )}
          <Stack
            sx={{
              flexDirection: "row",
              columnGap: "1rem",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cartItems?.length > 0 && (
              <Badge badgeContent={cartItems.length} color="error">
                <IconButton onClick={() => navigate("/cart")}>
                  <ShoppingCartOutlinedIcon />
                </IconButton>
              </Badge>
            )}

            {!loggedInUser?.isAdmin && (
              <Stack>
                <Badge badgeContent={wishlistItems?.length} color="error">
                  <IconButton component={Link} to={"/wishlist"}>
                    <FavoriteBorderIcon />
                  </IconButton>
                </Badge>
              </Stack>
            )}
            {isProductList && (
              <IconButton onClick={handleToggleFilters}>
                <TuneIcon sx={{ color: isProductFilterOpen ? "black" : "" }} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
