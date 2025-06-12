import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Paper } from '@mui/material';
import Header from './Header'; // Đảm bảo đường dẫn chính xác
import Footer from './Footer'; // Đảm bảo đường dẫn chính xác

// Bảng màu để tiện sử dụng
const palette = {
  dark: '#155E64',
  medium: '#75B39C',
  light: '#A0E4D0',
};

// --- DỮ LIỆU GIỚI THIỆU SẢN PHẨM ---
// Bạn hãy thay thế bằng sản phẩm thực tế của Movico Group

const techProducts = [
    {
        img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964&auto=format&fit=crop',
        title: 'Laptop Hiệu Năng Cao',
        description: 'Dòng laptop mới nhất với cấu hình mạnh mẽ, thiết kế mỏng nhẹ, đáp ứng mọi nhu cầu từ công việc đến giải trí.',
    },
    {
        img: 'https://images.unsplash.com/photo-1604881991720-f91add269612?q=80&w=2070&auto=format&fit=crop',
        title: 'Tai Nghe Khử Ồn Chủ Động',
        description: 'Trải nghiệm âm thanh tinh khiết, đắm chìm trong không gian riêng tư với công nghệ khử ồn hàng đầu.',
    },
    {
        img: 'https://images.unsplash.com/photo-1593305523952-62641a8777a8?q=80&w=2070&auto=format&fit=crop',
        title: 'Đồng Hồ Thông Minh Thế Hệ Mới',
        description: 'Không chỉ là một chiếc đồng hồ, mà còn là trợ lý sức khỏe và công việc tin cậy ngay trên cổ tay bạn.',
    },
];

const fashionProducts = [
    {
        img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
        title: 'Bộ Sưu Tập Áo Sơ Mi Lịch Lãm',
        description: 'Thiết kế tinh tế trên nền chất liệu cao cấp, mang lại vẻ ngoài chuyên nghiệp và tự tin cho phái mạnh.',
    },
    {
        img: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce67c40?q=80&w=1935&auto=format&fit=crop',
        title: 'Váy Đầm Dạo Phố Sang Trọng',
        description: 'Nét thanh lịch và quyến rũ được thể hiện qua từng đường cắt may, giúp bạn tỏa sáng trong mọi khoảnh khắc.',
    },
    {
        img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1974&auto=format&fit=crop',
        title: 'Quần Jeans & Phụ Kiện Năng Động',
        description: 'Sự kết hợp hoàn hảo giữa phong cách và sự thoải mái, khẳng định cá tính riêng của bạn.',
    },
];


function Landing() {
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#fff' }}>

            {/* --- Hero Section --- */}
            <Paper elevation={0} sx={{
                background: `linear-gradient(to right, ${palette.light}, ${palette.medium})`,
                pb: 8,
            }}>
                <Header />
                <Container>
                    <Grid container alignItems="center" spacing={4} sx={{ pt: { xs: 4, md: 10 }, color: palette.dark }}>
                        <Grid item md={7} xs={12}>
                            <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Movico Group
                            </Typography>
                            <Typography variant="h5" component="p" sx={{ mb: 4 }}>
                                Nơi công nghệ đỉnh cao gặp gỡ phong cách thời thượng.
                            </Typography>
                            <Typography variant="body1" sx={{ maxWidth: '550px', mb: 4 }}>
                                Chúng tôi tự hào mang đến những sản phẩm công nghệ tiên tiến và các bộ sưu tập thời trang đẳng cấp, tất cả được vận hành bởi một hệ thống kho vận thông minh và hiệu quả.
                            </Typography>
                            <Button variant="contained" size="large" sx={{ 
                                backgroundColor: palette.dark,
                                '&:hover': { backgroundColor: '#104c50' },
                                px: 4,
                                py: 1.5
                            }}>
                                Khám Phá Ngay
                            </Button>
                        </Grid>
                        <Grid item md={5} xs={12} sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                            <Box
                                component="img"
                                src="/images/287930.png" // Gợi ý: Dùng ảnh ghép sản phẩm tech và fashion
                                alt="Movico Group Products"
                                sx={{ maxWidth: '100%', height: 'auto' }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Paper>

            {/* --- Section giới thiệu Sản phẩm Công nghệ --- */}
            <Container sx={{ py: 8 }}>
                <Typography variant="h4" component="h2" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Sản Phẩm Công Nghệ
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
                    Tiên phong trong đổi mới, mang đến những trải nghiệm vượt trội.
                </Typography>
                <Grid container spacing={4}>
                    {techProducts.map((product, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                                <CardMedia component="img" height="240" image={product.img} alt={product.title} />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: '600' }}>
                                        {product.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {product.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            
            {/* --- Section giới thiệu Thời trang --- */}
            <Box sx={{ backgroundColor: '#f7f9fc', py: 8 }}>
                <Container>
                     <Typography variant="h4" component="h2" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Thời Trang Đẳng Cấp
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
                        Khẳng định phong cách, dẫn đầu xu hướng.
                    </Typography>
                    <Grid container spacing={4}>
                        {fashionProducts.map((product, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                                    <CardMedia component="img" height="240" image={product.img} alt={product.title} />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: '600' }}>
                                            {product.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {product.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* --- Section Nền tảng Vững chắc --- */}
            <Container sx={{ py: 8 }}>
                <Typography variant="h4" component="h2" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Nền Tảng Vững Chắc
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}>
                    Thành công của chúng tôi được xây dựng trên nền tảng quản lý kho vận tối ưu, đảm bảo mỗi sản phẩm đến tay bạn đều nhanh chóng, chính xác và an toàn.
                </Typography>
                 {/* Bạn có thể thêm 1-2 hình ảnh về kho bãi ở đây nếu muốn */}
            </Container>


            <Footer />
        </Box>
    );
}

export default Landing;