import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import LoginPage from './pages/Login';
import UsuarioList from './pages/usuarios/UsuarioList';
import GrupoList from './pages/usuarios/GrupoList';
import AlmacenMenu from './pages/almacen/AlmacenMenu';
import CambiarPassword from './pages/seguridad/CambiarPassword';
import GoogleCalendarPage from './pages/GoogleCalendarPage';
import CatalogosMenu from './pages/almacen/CatalogosMenu';
import PermisosPanel from './pages/administracion/PermisosPanel';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import logoBeExEn from './assets/logoBeExEn.png';

const API_URL = import.meta.env.VITE_API_URL;

function DashboardHome() {
	const [stock, setStock] = useState<any[]>([]);
	const [entradas, setEntradas] = useState<any[]>([]);
	const [salidas, setSalidas] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState({ totalArticulos: 0, stockBajo: 0, totalStock: 0 });

	useEffect(() => {
		const fetchAll = async () => {
			setLoading(true);
			try {
				// Stock
				const resStock = await fetch(`${API_URL}/almacen/stock`, {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
				});
				if (!resStock.ok) throw new Error('Error al cargar stock');
				const data = await resStock.json();
				const dataFixed = data.map((a: any) => ({ ...a, stock: Number(a.stock || 0) }));
				setStock(dataFixed);
				setStats({
					totalArticulos: dataFixed.length,
					stockBajo: dataFixed.filter((a: any) => a.stock < 5).length,
					totalStock: dataFixed.reduce((acc: number, a: any) => acc + a.stock, 0)
				});
				// Entradas
				const resEntradas = await fetch(`${API_URL}/almacen/entradas`, {	         
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
				});
				if (!resEntradas.ok) throw new Error('Error al cargar entradas');
				const dataEntradas = await resEntradas.json();
				setEntradas(dataEntradas);
				// Salidas
				const resSalidas = await fetch(`${API_URL}/almacen/salidas`, {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
				});
				if (!resSalidas.ok) throw new Error('Error al cargar salidas');
				const dataSalidas = await resSalidas.json();
				setSalidas(dataSalidas);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchAll();
	}, []);

	if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando dashboard...</span></div>;
	if (error) return <div className="alert alert-danger">Error: {error}</div>;

	// Entradas y salidas del mes actual
	const now = new Date();
	const mes = now.getMonth();
	const anio = now.getFullYear();
	const entradasMes = entradas.filter((e: any) => {
		const d = new Date(e.date);
		return d.getMonth() === mes && d.getFullYear() === anio;
	});
	const salidasMes = salidas.filter((s: any) => {
		const d = new Date(s.date);
		return d.getMonth() === mes && d.getFullYear() === anio;
	});
	return (
		<div className="row g-4">
			<div className="col-12 col-md-4">
				<div className="card bg-dark text-white mb-4">
					<div className="card-body">
						<h4 className="card-title mb-1">Total artículos</h4>
						<div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalArticulos}</div>
					</div>
				</div>
			</div>
			<div className="col-12 col-md-4">
				<div className="card bg-dark text-white mb-4">
					<div className="card-body">
						<h4 className="card-title mb-1">Stock bajo (&lt; 5)</h4>
						<div style={{ fontSize: 32, fontWeight: 700 }}>{stats.stockBajo}</div>
					</div>
				</div>
			</div>
			<div className="col-12 col-md-4">
				<div className="card bg-dark text-white mb-4">
					<div className="card-body">
						<h4 className="card-title mb-1">Stock total</h4>
						<div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalStock}</div>
					</div>
				</div>
			</div>
			{/* Top 10 más stock */}
			<div className="col-12 col-md-6">
				<div className="card bg-dark text-white mb-4">
					<div className="card-body">
						<h4 className="card-title mb-3">Top 10 artículos con más stock</h4>
						<div style={{ width: '100%', height: 300 }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={stock
									.filter(a => a.stock > 0)
									.sort((a, b) => b.stock - a.stock)
									.slice(0, 10)} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#444" />
									<XAxis dataKey="name" stroke="#fff" tick={{ fontSize: 12 }} />
									<YAxis stroke="#fff" />
									<Tooltip contentStyle={{ background: '#222', color: '#fff' }} />
									<Bar dataKey="stock" fill="#0d6efd" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</div>
			{/* Top 10 menos stock */}
			<div className="col-12 col-md-6">
				<div className="card bg-dark text-white mb-4">
					<div className="card-body">
						<h4 className="card-title mb-3">Top 10 artículos con menor stock</h4>
						<div style={{ width: '100%', height: 300 }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={stock
									.filter(a => a.stock > 0)
									.sort((a, b) => a.stock - b.stock)
									.slice(0, 10)} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#444" />
									<XAxis dataKey="name" stroke="#fff" tick={{ fontSize: 12 }} />
									<YAxis stroke="#fff" />
									<Tooltip contentStyle={{ background: '#222', color: '#fff' }} />
									<Bar dataKey="stock" fill="#dc3545" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</div>
			{/* Entradas vs Salidas del mes */}
			<div className="col-12">
				<div className="card bg-dark text-white mb-4">
					<div className="card-body">
						<h4 className="card-title mb-3">Entradas vs Salidas (mes actual)</h4>
						<div style={{ width: '100%', height: 300 }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={[
									{ name: 'Entradas', cantidad: entradasMes.reduce((acc, e) => acc + Number(e.quantity), 0) },
									{ name: 'Salidas', cantidad: salidasMes.reduce((acc, s) => acc + Number(s.quantity), 0) }
								]} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#444" />
									<XAxis dataKey="name" stroke="#fff" tick={{ fontSize: 12 }} />
									<YAxis stroke="#fff" />
									<Tooltip contentStyle={{ background: '#222', color: '#fff' }} />
									<Bar dataKey="cantidad" fill="#198754" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function Dashboard({ user }: { user: any }) {
	const [current, setCurrent] = useState('dashboard');
	const [openAlmacenNavbar, setOpenAlmacenNavbar] = useState(false);
	const [openAlmacenSidebar, setOpenAlmacenSidebar] = useState(false);
	const [showMobileSidebar, setShowMobileSidebar] = useState(false);
	
	// Inicializar tema
	const { theme } = useTheme();
	
	// Aplicar tema al cargar
	useEffect(() => {
		document.documentElement.setAttribute('data-bs-theme', theme);
	}, [theme]);

	const sidebarItems = [
		{
			label: 'Home',
			key: 'dashboard',
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="icon icon-1"
				>
					<path d="M5 12l-2 0l9 -9l9 9l-2 0" />
					<path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
					<path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
				</svg>
			),
		},
		{
			label: 'Almacén',
			key: 'almacen',
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="icon icon-1"
				>
					<rect x="3" y="7" width="18" height="13" rx="2" />
					<path d="M16 3v4" />
					<path d="M8 3v4" />
					<path d="M3 11h18" />
				</svg>
			),
			children: [
				{ label: 'Artículos', key: 'articulos' },
				{ label: 'Entradas', key: 'entradas' },
				{ label: 'Salidas', key: 'salidas' },
				{ label: 'Stock', key: 'stock' },
				{ label: 'Ajustes', key: 'ajustes' },
				{ label: 'Catálogos', key: 'catalogos' },
			],
		},
		...(user?.group === 'admin'
			? [
				{
					label: 'Usuarios',
					key: 'usuarios',
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="icon icon-1"
						>
							<circle cx="9" cy="7" r="4" />
							<path d="M17 11v-1a4 4 0 0 0-4-4h-1" />
							<path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
						</svg>
					),
				},
				{
					label: 'Grupos',
					key: 'grupos',
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="icon icon-1"
						>
							<circle cx="12" cy="7" r="4" />
							<path d="M5.5 21v-2a4.5 4.5 0 0 1 9 0v2" />
							<path d="M17 11v-1a4 4 0 0 0-4-4h-1" />
						</svg>
					),
				},
				{
					label: 'Administración RBAC',
					key: 'administracion',
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="icon icon-1"
						>
							<path d="M9 12l2 2 4-4" />
							<path d="M21 12c-1.4 0-2.5-.9-2.5-2s1.1-2 2.5-2 2.5.9 2.5 2-1.1 2-2.5 2z" />
							<path d="M21 6c-1.4 0-2.5-.9-2.5-2S19.6 2 21 2s2.5.9 2.5 2S22.4 6 21 6z" />
							<path d="M21 18c-1.4 0-2.5-.9-2.5-2s1.1-2 2.5-2 2.5.9 2.5 2-1.1 2-2.5 2z" />
							<path d="M9 6H3" />
							<path d="M9 12H3" />
							<path d="M9 18H3" />
						</svg>
					),
				},
			]
			: []),
		{
			label: 'Calendario',
			key: 'calendar',
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="icon icon-1"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<path d="M3 10h18" />
					<path d="M10 3v18" />
				</svg>
			),
		},
		{
			label: 'Seguridad',
			key: 'seguridad',
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="12" r="3" /></svg>
			),
		},
	];

	let content = null;
	if (current === 'usuarios') {
		content = <UsuarioList />;
	} else if (current === 'grupos') {
		content = <GrupoList />;
	} else if (['articulos', 'entradas', 'salidas', 'stock', 'ajustes'].includes(current)) {
		content = <AlmacenMenu initialTab={current} />;
	} else if (current === 'catalogos') {
		content = <CatalogosMenu />;
	} else if (current === 'calendar') {
		content = <GoogleCalendarPage />;
	} else if (current === 'seguridad') {
		content = <CambiarPassword />;
	} else if (current === 'administracion') {
		content = <PermisosPanel />;
	} else {
		content = <DashboardHome />;
	}
	return (
		<div
			className="page"
			style={{
				minHeight: '100vh',
				width: '100vw',
				background: '#181a2a',
			}}
		>
			{/* Navbar superior tipo Tabler */}
			<header
				className="navbar navbar-expand-md navbar-dark sticky-top"
				style={{
					background: '#181a2a',
					minHeight: 64,
					zIndex: 1050,
					width: '100%',
					left: 0,
					right: 0,
					top: 0,
					borderBottom: '1px solid rgba(255,255,255,0.1)'
				}}
			>
				<div
					className="container-fluid d-flex align-items-center justify-content-between px-3 px-md-4"
					style={{ height: 64 }}
				>
					<div className="d-flex align-items-center flex-grow-1">
						{/* Botón hamburguesa para móvil */}
						<button 
							className="btn btn-outline-light d-md-none me-3"
							onClick={() => setShowMobileSidebar(!showMobileSidebar)}
							style={{
								padding: '0.375rem 0.75rem',
								borderRadius: '0.375rem'
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<line x1="3" y1="6" x2="21" y2="6"></line>
								<line x1="3" y1="12" x2="21" y2="12"></line>
								<line x1="3" y1="18" x2="21" y2="18"></line>
							</svg>
						</button>
						
						{/* Logo y nombre de Be-ExEn */}
						<div className="d-flex align-items-center gap-2 gap-md-3 me-3">
							<div style={{
								height: 32,
								width: 32,
								borderRadius: '6px',
								background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
								padding: '3px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
							}}>
								<img 
									src={logoBeExEn} 
									alt="Be-ExEn Logo" 
									style={{ 
										height: '100%', 
										width: '100%',
										objectFit: 'contain'
									}} 
								/>
							</div>														 
							<div>
								<span style={{ 
									fontWeight: 700, 
									fontSize: window.innerWidth < 768 ? 18 : 22, 
									color: '#fff', 
									letterSpacing: '0.8px',
									textShadow: '0 1px 2px rgba(0,0,0,0.1)'
								}}>
									Be-Exen
								</span>
							</div>
						</div>
						<ul className="navbar-nav flex-row d-none d-md-flex">
								{sidebarItems.map(item => (
								item.children ? (
									<li className="nav-item px-2 position-relative" key={item.key}>
										<a
											className="nav-link"
											href="#"
											onClick={e => {
												e.preventDefault();
												setOpenAlmacenNavbar(open => !open);
											}}
										>
											<span className="nav-link-icon">{item.icon}</span>
											<span className="nav-link-title"> {item.label} </span>
											<span style={{ marginLeft: 4 }}>&#9660;</span>
										</a>
										{openAlmacenNavbar && (
											<div className="dropdown-menu show position-absolute bg-dark border-0" style={{ top: '100%', left: 0, minWidth: 180, zIndex: 2000 }}>
												<div className="dropdown-menu-columns">
													<div className="dropdown-menu-column">
														{item.children.map(child => (
															<a
																key={child.key}
																className={`dropdown-item${current === child.key ? ' active' : ''}`}
																href="#"
																style={{ color: '#fff', background: current === child.key ? '#0d6efd' : 'transparent' }}
																onClick={e => {
																	e.preventDefault();
																	setCurrent(child.key);
																	setOpenAlmacenNavbar(false);
																}}
															>
																{child.label}
															</a>
														))}
													</div>
												</div>
											</div>
										)}
									</li>
								) : (
									<li
										className={`nav-item px-2${current === item.key ? ' active' : ''}`}
										key={item.key}
									>
										<a
											className="nav-link"
											href="#"
											onClick={e => {
												e.preventDefault();
												setCurrent(item.key);
											}}
										>
											<span className="nav-link-icon">{item.icon}</span>
											<span className="nav-link-title"> {item.label} </span>
										</a>
									</li>
								)
							))}
						</ul>
					</div>
					<div className="d-flex align-items-center">
						{/* Imagen dummy de usuario */}
						<img src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.username || 'Usuario') + '&background=0D6EFD&color=fff&size=40'} alt="Usuario" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} className="d-block d-md-none" />
						<img src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.username || 'Usuario') + '&background=0D6EFD&color=fff&size=40'} alt="Usuario" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} className="d-none d-md-block" />
						<div className="d-none d-lg-block ps-2">
							<div style={{ fontSize: 14 }}>{user?.username || 'Usuario'}</div>
							<div className="mt-1 small text-secondary">{user?.group || 'Rol'}</div>
						</div>
						
						{/* Theme Toggle */}
						<ThemeToggle className="ms-2" />
						
						<a
							href="#"
							className="btn btn-danger ms-2 ms-md-4 btn-sm d-md-none"
							onClick={() => {
								localStorage.removeItem('token');
								window.location.reload();
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
								<polyline points="16,17 21,12 16,7"></polyline>
								<line x1="21" y1="12" x2="9" y2="12"></line>
							</svg>
						</a>
						<a
							href="#"
							className="btn btn-danger ms-4 d-none d-md-block"
							onClick={() => {
								localStorage.removeItem('token');
								window.location.reload();
							}}
						>
							Salir
						</a>
					</div>
				</div>
			</header>
			{/* Sidebar vertical tipo Tabler */}
			<aside
				className={`navbar navbar-vertical navbar-expand-sm position-fixed h-100 d-none d-md-block ${showMobileSidebar ? 'd-block' : ''}`}
				data-bs-theme="dark"
				style={{
					left: 0,
					top: 64,
					bottom: 0,
					width: 250,
					zIndex: 1040,
					background: '#181a2a',
				}}
			>
				<div className="container-fluid flex-column h-100 pt-3">
					<div
						className="collapse navbar-collapse flex-grow-1"
						id="sidebar-menu"
					>
						<ul className="navbar-nav pt-lg-3 flex-column">
							{sidebarItems.map(item => (
								item.children ? (
									<li className="nav-item" key={item.key}>
										<div className="nav-link" style={{ cursor: 'pointer', fontWeight: 600, color: '#0d6efd' }} onClick={() => setOpenAlmacenSidebar(open => !open)}>
											<span className="nav-link-icon">{item.icon}</span>
											<span className="nav-link-title"> {item.label} </span>
											<span style={{ marginLeft: 4 }}>&#9660;</span>
										</div>
										{openAlmacenSidebar && (
											<ul className="navbar-nav flex-column ms-3">
												{item.children.map(child => (
													<li className="nav-item" key={child.key}>
														<a
															className={`nav-link${current === child.key ? ' active' : ''}`}
															href="#"
															style={{ color: current === child.key ? '#fff' : '#6c757d', background: current === child.key ? '#0d6efd' : 'transparent', borderRadius: 4, fontWeight: 500, margin: '2px 0' }}
															onClick={e => {
																e.preventDefault();
																setCurrent(child.key);
																setShowMobileSidebar(false);
															}}
														>
															{child.label}
														</a>
													</li>
												))}
											</ul>
										)}
									</li>
								) : (
									<li
										className={`nav-item px-2${current === item.key ? ' active' : ''}`}
										key={item.key}
									>
										<a
											className="nav-link"
											href="#"
											onClick={e => {
												e.preventDefault();
												setCurrent(item.key);
												setShowMobileSidebar(false);
											}}
										>
											<span className="nav-link-icon">{item.icon}</span>
											<span className="nav-link-title"> {item.label} </span>
										</a>
									</li>
								)
							))}
						</ul>
					</div>
				</div>
			</aside>
			
			{/* Mobile Sidebar Overlay */}
			{showMobileSidebar && (
				<>
					<div 
						className="position-fixed w-100 h-100 d-md-none"
						style={{
							top: 0,
							left: 0,
							backgroundColor: 'rgba(0,0,0,0.5)',
							zIndex: 1039
						}}
						onClick={() => setShowMobileSidebar(false)}
					></div>
					<aside
						className="navbar navbar-vertical navbar-expand-sm position-fixed h-100 d-md-none"
						data-bs-theme="dark"
						style={{
							left: showMobileSidebar ? 0 : -250,
							top: 64,
							bottom: 0,
							width: 250,
							zIndex: 1040,
							background: '#181a2a',
							transition: 'left 0.3s ease'
						}}
					>
						<div className="container-fluid flex-column h-100 pt-3">
							<div className="collapse navbar-collapse flex-grow-1 show">
								<ul className="navbar-nav pt-lg-3 flex-column">
									{sidebarItems.map(item => (
										item.children ? (
											<li className="nav-item" key={item.key}>
												<div className="nav-link" style={{ cursor: 'pointer', fontWeight: 600, color: '#0d6efd' }} onClick={() => setOpenAlmacenSidebar(open => !open)}>
													<span className="nav-link-icon">{item.icon}</span>
													<span className="nav-link-title"> {item.label} </span>
													<span style={{ marginLeft: 4 }}>&#9660;</span>
												</div>
												{openAlmacenSidebar && (
													<ul className="navbar-nav flex-column ms-3">
														{item.children.map(child => (
															<li className="nav-item" key={child.key}>
																<a
																	className={`nav-link${current === child.key ? ' active' : ''}`}
																	href="#"
																	style={{ color: current === child.key ? '#fff' : '#6c757d', background: current === child.key ? '#0d6efd' : 'transparent', borderRadius: 4, fontWeight: 500, margin: '2px 0' }}
																	onClick={e => {
																		e.preventDefault();
																		setCurrent(child.key);
																		setShowMobileSidebar(false);
																	}}
																>
																	{child.label}
																</a>
															</li>
														))}
													</ul>
												)}
											</li>
										) : (
											<li
												className={`nav-item px-2${current === item.key ? ' active' : ''}`}
												key={item.key}
											>
												<a
													className="nav-link"
													href="#"
													onClick={e => {
														e.preventDefault();
														setCurrent(item.key);
														setShowMobileSidebar(false);
													}}
												>
													<span className="nav-link-icon">{item.icon}</span>
													<span className="nav-link-title"> {item.label} </span>
												</a>
											</li>
										)
									))}
								</ul>
							</div>
						</div>
					</aside>
				</>
			)}
			{/* Contenido principal debajo del navbar y sidebar */}
			<div
				className="page-wrapper"
				style={{
					marginLeft: window.innerWidth >= 768 ? 250 : 0,
					paddingTop: 64,
					minHeight: 'calc(100vh - 64px)',
					background: '#181a2a',
					transition: 'margin-left 0.3s ease'
				}}
			>
				<div
					className="page-body"
					style={{ 
						minHeight: 'calc(100vh - 64px)',
						padding: '1rem 0'
					}}
				>
					<div className="container-xl px-3 px-md-4">
						{/* Header responsivo para evitar que se pegue al menú */}
						<div className="page-header-responsive mb-3">
							{content}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function App() {
	const [user, setUser] = useState<any>(() => {
		// Mantener sesión si hay token
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				return payload.user;
			} catch {
				return null;
			}
		}
		return null;
	});
	if (!user) {
		return <LoginPage onLogin={setUser} />;
	}
	return (
		<GoogleOAuthProvider clientId="125375132260-aq6pe7g161f8nr9ofrudiemtkhodc1q3.apps.googleusercontent.com">
			<Dashboard user={user} />
		</GoogleOAuthProvider>
	);
}

export default App;
