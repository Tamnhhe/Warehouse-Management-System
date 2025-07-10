//filterrddd 
import React, { useState } from "react";
import { Form } from "react-bootstrap";

const FilterProduct = ({ onFilter }) => {
  const [sortBy, setSortBy] = useState("");
  const [filterText, setFilterText] = useState("");

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    onFilter({ sortBy: e.target.value, filterText });
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
    onFilter({ sortBy, filterText: e.target.value }); // Gửi giá trị ngay lập tức
  };

  return (
    <div className="mb-3 d-flex gap-2">
      <Form.Control
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={filterText}
        onChange={handleFilterChange} // Gửi dữ liệu ngay khi nhập
      />
      
    </div>
  );
};

export default FilterProduct;
