# Model — Field Boundary

Planar interface between two linear isotropic media. Static fields only;
no free surface charge or free surface current.

## Coordinates

- Origin on the interface; \(+x\) tangential; \(+\hat{n}=+\hat{y}\) into medium 1 (upper half-plane).
- Medium 1: \(y>0\). Medium 2: \(y<0\).
- Primary angle \(\theta\) is measured from \(\hat{n}\) toward \(+\hat{x}\):
  \(E_t = |E|\sin\theta\), \(E_n = |E|\cos\theta\).

## Electric (Intro)

With \(\sigma_f=0\) and \(\varepsilon=\varepsilon_r\) (\(\varepsilon_0=1\)):

\[
E_{2t}=E_{1t},\qquad
E_{2n}=\frac{\varepsilon_1}{\varepsilon_2}E_{1n},\qquad
\vec{D}_i=\varepsilon_i\vec{E}_i.
\]

Hence \(D_{1n}=D_{2n}\) and \(D_{2t}/D_{1t}=\varepsilon_2/\varepsilon_1\).

Field-line angles from the normal satisfy

\[
\frac{\tan\theta_2}{\tan\theta_1}=\frac{\varepsilon_2}{\varepsilon_1}.
\]

## Magnetic (Magnetics)

With \(K_f=0\) and \(\mu=\mu_r\) (\(\mu_0=1\)):

\[
H_{2t}=H_{1t},\qquad
H_{2n}=\frac{\mu_1}{\mu_2}H_{1n},\qquad
\vec{B}_i=\mu_i\vec{H}_i.
\]

## Display

Medium-2 physics vectors \((F_t,F_n)\) are drawn as \((F_t,-F_n)\) so the tip
lies in the lower half-plane. Companion \(\vec{D}\) or \(\vec{B}\) arrows are
auto-scaled relative to the primary so large \(\varepsilon_r\)/\(\mu_r\) stay on-screen.
