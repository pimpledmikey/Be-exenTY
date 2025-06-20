import { Layout, Navbar, Nav, NavItem, Sidebar, SidebarSection, SidebarNav, SidebarNavItem, Container } from 'tabler-react';
import { IconUsers, IconHome, IconBuildingWarehouse, IconUserPlus, IconUserCog } from '@tabler/icons-react';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavChange: (key: string) => void;
  current: string;
}

const menu = [
  { key: 'dashboard', label: 'Dashboard', icon: <IconHome size={20} /> },
  { key: 'almacen', label: 'Almacén', icon: <IconBuildingWarehouse size={20} /> },
  { key: 'usuarios', label: 'Usuarios', icon: <IconUsers size={20} /> },
  { key: 'crear-usuario', label: 'Crear usuario', icon: <IconUserPlus size={20} /> },
  { key: 'grupos', label: 'Grupos', icon: <IconUserCog size={20} /> },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavChange, current }) => (
  <Layout>
    <Navbar>
      <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
        <img src="/logo192.png" alt="Logo" height={32} />
        <span className="fw-bold">Be-exenTY</span>
      </Navbar.Brand>
      <Nav className="ms-auto">
        <NavItem href="#" icon="logout">Salir</NavItem>
      </Nav>
    </Navbar>
    <Layout>
      <Sidebar>
        <SidebarSection>
          <SidebarNav>
            {menu.map(item => (
              <SidebarNavItem
                key={item.key}
                active={current === item.key}
                onClick={() => onNavChange(item.key)}
                icon={item.icon}
              >
                {item.label}
              </SidebarNavItem>
            ))}
          </SidebarNav>
        </SidebarSection>
      </Sidebar>
      <Container className="py-4" style={{ minHeight: '90vh' }}>
        {children}
      </Container>
    </Layout>
  </Layout>
);

export default MainLayout;
