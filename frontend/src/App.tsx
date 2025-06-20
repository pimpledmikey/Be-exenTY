import { useState } from 'react';
import LoginPage from './pages/Login';
import UsuarioList from './pages/usuarios/UsuarioList';
import GrupoList from './pages/usuarios/GrupoList';
import AlmacenMenu from './pages/almacen/AlmacenMenu';

function Dashboard({ user }: { user: any }) {
	const [current, setCurrent] = useState('dashboard');

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
			]
			: []),
	];

	let content = null;
	if (current === 'usuarios') {
		content = <UsuarioList />;
	} else if (current === 'grupos') {
		content = <GrupoList />;
	} else if (current === 'almacen') {
		content = <AlmacenMenu />;
	} else {
		content = (
			<div className="row row-deck row-cards">
				<div className="col-12 col-lg-6">
					<div className="card bg-dark text-white mb-4">
						<div className="card-body">
							<h3 className="card-title">
								Bienvenido, {user?.username || 'Usuario'}
							</h3>
							<p className="card-text">
								Aquí verás el resumen de tu sistema. Cuando subas inventario,
								aparecerán los datos aquí.
							</p>
						</div>
					</div>
				</div>
				<div className="col-6 col-lg-3">
					<div className="card bg-dark text-white mb-4">
						<div className="card-body">
							<h4 className="card-title">Usuarios</h4>
							<p className="card-text">Gestiona los usuarios del sistema.</p>
						</div>
					</div>
				</div>
				<div className="col-6 col-lg-3">
					<div className="card bg-dark text-white mb-4">
						<div className="card-body">
							<h4 className="card-title">Almacén</h4>
							<p className="card-text">Sube y administra tu inventario aquí.</p>
						</div>
					</div>
				</div>
				<div className="col-12 col-lg-6">
					<div className="card bg-dark text-white mb-4">
						<div className="card-body">
							<h4 className="card-title">Grupos</h4>
							<p className="card-text">Organiza los grupos de trabajo.</p>
						</div>
					</div>
				</div>
			</div>
		);
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
					width: '100vw',
					left: 0,
					right: 0,
					top: 0,
				}}
			>
				<div
					className="container-xl d-flex align-items-center justify-content-between"
					style={{ height: 64 }}
				>
					<div className="d-flex align-items-center">
						<a
							href="#"
							className="navbar-brand d-flex align-items-center me-4"
						>
							<img
								src="/static/logo-white.svg"
								width="110"
								height="32"
								alt="Tabler"
								className="navbar-brand-image"
							/>
						</a>
						<ul className="navbar-nav flex-row d-none d-md-flex">
							{sidebarItems.map(item => (
								<li
									className={`nav-item px-2${
										current === item.key ? ' active' : ''
									}`}
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
							))}
						</ul>
					</div>
					<div className="d-flex align-items-center">
						<span
							className="avatar avatar-sm ms-3"
							style={{ backgroundImage: 'url(/static/avatars/044m.jpg)' }}
						></span>
						<div className="d-none d-xl-block ps-2">
							<div>{user?.username || 'Usuario'}</div>
							<div className="mt-1 small text-secondary">
								{user?.group || 'UI Designer'}
							</div>
						</div>
						<a
							href="#"
							className="btn btn-danger ms-4"
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
				className="navbar navbar-vertical navbar-expand-sm position-fixed h-100"
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
								<li
									className={`nav-item${
										current === item.key ? ' active' : ''
									}`}
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
							))}
						</ul>
					</div>
				</div>
			</aside>
			{/* Contenido principal debajo del navbar y sidebar */}
			<div
				className="page-wrapper"
				style={{
					marginLeft: 250,
					paddingTop: 64,
					minHeight: 'calc(100vh - 64px)',
					background: '#181a2a',
				}}
			>
				<div
					className="page-header d-print-none"
					style={{ display: 'none' }}
				>
					{/* Eliminado el header duplicado */}
				</div>
				<div
					className="page-body"
					style={{ minHeight: 'calc(100vh - 64px)' }}
				>
					<div className="container-xl">{content}</div>
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
	return <Dashboard user={user} />;
}

export default App;
