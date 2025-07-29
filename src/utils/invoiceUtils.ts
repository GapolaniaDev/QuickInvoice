export function getKitchenCleaningDays(startDate: Date, endDate: Date) {
  const weekdays = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      let room = "";

      // Determinar el valor para el campo room según el día de la semana
      switch (dayOfWeek) {
        case 1: // Lunes
          room = "floor 1, 2, 3, 4 (128 Waymouth St)";
          break;
        case 2: // Martes
          room = "floor 5, 6, 7, 8 (128 Waymouth St)";
          break;
        case 3: // Miércoles
          room = "floor 9, 10, 11, 12 (128 Waymouth St)";
          break;
        case 4: // Jueves
          room = "floor 13, 14, 15, 16 (128 Waymouth St)";
          break;
        default:
          room = "Unknown";
      }

      const formattedDate = `${year}/${month}/${day}`;
      weekdays.push({
        date: formattedDate,
        room,
        description: "Kitchen cleaning",
        amount: 120,
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekdays;
}

export function getNightCleaningDays(startDate: Date, endDate: Date) {
  const weekdays = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      let room = "";

      // Determinar el valor para el campo room según el día de la semana
      switch (dayOfWeek) {
        case 1: // Lunes
          room = "Night Clean (Y-Suite city Gardens)";
          break;
        case 2: // Martes
          room = "Night Clean (Y-Suite city Gardens)";
          break;
        case 3: // Miércoles
          room = "Night Clean (Y-Suite city Gardens)";
          break;
        case 4: // Jueves
          room = "Night Clean (Y-Suite city Gardens)";
          break;
        default:
          room = "Unknown";
      }

      const formattedDate = `${year}/${month}/${day}`;
      weekdays.push({
        date: formattedDate,
        room,
        description: "Night cleaning",
        amount: 90,
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekdays;
}

export function getInvoiceNumber(date: Date): number {
  // Obtener el primer lunes de enero
  const year = date.getFullYear();
  const firstMonday = new Date(year, 0, 1);

  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1);
  }

  // Calcular la diferencia en días entre la fecha actual y el primer lunes
  const diffDays = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));

  // Convertir los días en número de factura (cada 14 días aumenta en 1)
  return Math.floor(diffDays / 14) + 1;
}

export function getDayOfWeek(dateString: string): string {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

export function formatDateForExcel(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const optionsStart = { month: 'short', day: 'numeric' } as const;
  const optionsEnd = { month: 'long', day: 'numeric' } as const;
  
  const formattedStartDate = start.toLocaleDateString('en-US', optionsStart);
  const formattedEndDate = end.toLocaleDateString('en-US', optionsEnd);
  
  return { formattedStartDate, formattedEndDate };
}

export function generateInvoiceTitle(
  employeeName: string, 
  employeeLastname: string, 
  startDate: string, 
  endDate: string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const optionsStart = { month: 'short', day: 'numeric' } as const;
  const optionsEnd = { month: 'long', day: 'numeric' } as const;
  
  const formattedStartDate = start.toLocaleDateString('en-US', optionsStart);
  const formattedEndDate = end.toLocaleDateString('en-US', optionsEnd);
  
  return `Invoice ${employeeName} ${employeeLastname} ${formattedStartDate} to ${formattedEndDate}`;
}